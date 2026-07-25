from fastapi import APIRouter, Depends
from pydantic import BaseModel
import json
from app.core.config import settings
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(tags=["合规风险审查"])

# 统一返回封装
def resp(data, msg="success", code=200):
    return {"code": code, "msg": msg, "data": data}

# 请求体模型
class RiskCheckReq(BaseModel):
    docText: str
    taskId: str | None = None

@router.post("/check")
def check_document_risk(req: RiskCheckReq, db: Session = Depends(get_db)):
    # 构造风险检测提示词
    prompt = f"""
分析以下采购招标文件内容，识别全部合规风险，仅输出标准JSON数组，禁止多余文字、解释、注释。
每条风险包含4个固定key：
1. risk_level：高/中/低
2. risk_content：风险对应原文条款
3. risk_reason：违规法律/采购规范原因
4. suggest：具体整改建议
文档内容：
{req.docText}
"""
    # 调用LLM（你项目原有llm_call工具，按需替换导入）
    from app.utils.llm import llm_call
    llm_res = llm_call(
        prompt=prompt,
        model=settings.LLM_MODEL,
        url=settings.LLM_CHAT_URL,
        api_key=settings.LLM_API_KEY
    )
    try:
        risk_list = json.loads(llm_res)
    except Exception as e:
        return resp(None, f"AI解析失败：{str(e)}", 500)
    
    # 写入风险记录表
    insert_sql = text("""
        INSERT INTO risk_record (task_id, doc_text, risk_result)
        VALUES (:tid, :text, :res)
    """)
    db.execute(insert, {
        "tid": req.taskId,
        "text": req.docText,
        "res": json.dumps(risk_list, ensure_ascii=False)
    })
    db.commit()
    return resp({"riskList": risk_list})