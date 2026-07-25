from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

import json
import os
import uuid

from app.core.database import get_db
from app.core.common import success_response, error_response
from app.core.config import settings
from utils.template_engine import BidTemplateEngine

router = APIRouter()

# ====================== 原有旧接口（项目版，路径统一 /generate，保留不动） ======================
class ProjectIdReq(BaseModel):
    project_id: int

@router.post("/generate", summary="AI生成采购文件（旧版-绑定项目）")
def generate_document(req: ProjectIdReq, db: Session = Depends(get_db)):
    from app.services import project as project_service
    from app.schemas.project import ProjectUpdate
    from app.core.llm import generate_procurement_file

    pid = req.project_id
    obj = project_service.get_project_by_id(db, pid)
    if not obj:
        return error_response("项目不存在")
    content = generate_procurement_file(obj)
    project_service.update_project(db, ProjectUpdate(generatedDocContent=content, projectStatus="finished"))
    return success_response(data={"project_id": pid, "file_content": content}, message="生成完成")

@router.post("/risk-check", summary="采购文件风险检测（旧版）")
def risk_check(req: ProjectIdReq, db: Session = Depends(get_db)):
    from app.services import project as project_service

    pid = req.project_id
    obj = project_service.get_project_by_id(db, pid)
    if not obj or not obj.generatedDocContent:
        return error_response("暂无有效采购文档")
    return success_response(data={
        "project_id": pid,
        "risk_list": [],
        "risk_count": 0
    }, message="检测完成")

@router.post("/export", summary="导出采购文件（旧版）")
def export_doc(req: ProjectIdReq, db: Session = Depends(get_db)):
    from app.services import project as project_service

    pid = req.project_id
    obj = project_service.get_project_by_id(db, pid)
    if not obj or not obj.generatedDocContent:
        return error_response("暂无可导出文档")
    return success_response(data={
        "project_id": pid,
        "file_name": f"采购文件_{pid}.docx",
        "content": obj.generatedDocContent
    }, message="导出数据获取成功")

# ====================== 新版V3.2 无项目草稿生成流程（独立路径 /async-generate） ======================
class GenerateDocReq(BaseModel):
    templateType: str
    docType: str
    source: str  # ai / form
    formData: dict

# 后台异步生成任务（纯模板渲染、仅操作task任务表、完全不碰项目表）
def doc_generate_task(task_id: str, req: GenerateDocReq, db: Session):
    try:
        # 更新进度20%
        db.execute(text("UPDATE procurement_task SET status='processing', progress=20 WHERE task_id=:tid"), {"tid": task_id})
        db.commit()

        # 匹配模板文件
        target_template = None
        for t in settings.TEMPLATE_MAP:
            if t["templateType"] == req.templateType and t["docType"] == req.docType:
                target_template = t
                break
        if not target_template:
            raise Exception("未匹配对应模板文件")
        template_path = os.path.join(settings.TEMPLATE_ROOT, target_template["file"])

        # 模板渲染生成docx
        temp_file = f"./temp_{task_id}.docx"
        engine = BidTemplateEngine(template_path)
        engine.render(req.formData, temp_file)

        # 读取文件、删除临时文件
        with open(temp_file, "rb") as f:
            file_buf = f.read()
        os.remove(temp_file)

        # 保存正式文件
        output_dir = r"D:\procurement-backend\output"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        save_name = f"{req.docType}_{task_id}.docx"
        save_path = os.path.join(output_dir, save_name)
        with open(save_path, "wb") as f:
            f.write(file_buf)

        # 任务完成 100%
        db.execute(text("""
            UPDATE procurement_task 
            SET status='completed', progress=100, file_path=:fp, complete_time=NOW()
            WHERE task_id=:tid
        """), {"fp": save_path, "tid": task_id})
        db.commit()

    except Exception as e:
        err_msg = str(e)
        db.execute(text("""
            UPDATE procurement_task SET status='failed', error_msg=:err, progress=0 WHERE task_id=:tid
        """), {"err": err_msg, "tid": task_id})
        db.commit()

# 创建异步生成任务（新版无项目，路径 /async-generate）
@router.post("/async-generate", summary="新建文档异步生成任务（新版无项目流程）")
def create_generate_task(
    req: GenerateDocReq,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    task_id = str(uuid.uuid4())
    # 插入任务记录
    insert_task = text("""
        INSERT INTO procurement_task (task_id, template_type, doc_type, source, form_data, status, progress)
        VALUES (:tid, :ttype, :dtype, :src, :fdata, 'pending', 0)
    """)
    db.execute(insert_task, {
        "tid": task_id,
        "ttype": req.templateType,
        "dtype": req.docType,
        "src": req.source,
        "fdata": json.dumps(req.formData, ensure_ascii=False)
    })
    db.commit()

    background_tasks.add_task(doc_generate_task, task_id, req, db)
    return success_response({"taskId": task_id}, "任务已创建")

# 查询进度
@router.get("/{task_id}", summary="查询生成任务进度")
def get_task_info(task_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("""
        SELECT task_id, template_type, doc_type, status, progress, file_path, error_msg, create_time, complete_time
        FROM procurement_task WHERE task_id=:tid
    """), {"tid": task_id}).fetchone()
    if not row:
        return error_response("任务不存在", 404)

    step_list = [
        {"name": "参数校验", "status": "done" if row.progress >= 20 else "pending"},
        {"name": "加载模板", "status": "done" if row.progress >= 40 else "active" if row.progress >=20 else "pending"},
        {"name": "填充表单数据", "status": "done" if row.progress >=60 else "active" if row.progress >=40 else "pending"},
        {"name": "生成文档", "status": "done" if row.progress >=80 else "active" if row.progress >=60 else "pending"},
        {"name": "文件导出完成", "status": "done" if row.progress ==100 else "active" if row.progress >=80 else "pending"},
    ]

    data = {
        "taskId": row.task_id,
        "templateType": row.template_type,
        "docType": row.doc_type,
        "status": row.status,
        "progress": row.progress,
        "error": row.error_msg,
        "steps": step_list
    }
    return success_response(data)

# 下载文件
@router.get("/{task_id}/download", summary="下载生成完成的docx文件")
def download_doc(task_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("SELECT file_path, status FROM procurement_task WHERE task_id=:tid"), {"tid": task_id}).fetchone()
    if not row:
        return error_response("任务不存在", 404)
    if row.status != "completed":
        return error_response("文件尚未生成完成，请等待")
    if not os.path.exists(row.file_path):
        return error_response("文件已丢失", 404)

    return FileResponse(
        path=row.file_path,
        filename=os.path.basename(row.file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
