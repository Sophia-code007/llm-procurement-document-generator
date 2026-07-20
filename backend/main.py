import os
import uuid
from datetime import datetime
from fastapi import FastAPI, Request, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

# 1. 优先加载配置、数据库（顺序不能乱）
from app.core.config import settings
from app.core.database import engine, Base, get_db, create_extend_tables

# 2. 先初始化数据库表（必须在app创建前执行）
Base.metadata.create_all(bind=engine)
create_extend_tables()

# 3. 全局文件夹初始化
os.makedirs("template", exist_ok=True)
os.makedirs("output", exist_ok=True)
TEMPLATE_FILE = "./template/bid_template_with_placeholders.docx"

# 4. 路由、工具导入（数据库初始化完成后再导入）
from app.api.v1 import template, ai, document, risk
from app.api.requirements import router as req_router
from app.api.v1.document import router as doc_router
from app.api.v1 import project
from utils.template_engine import BidTemplateEngine, BID_TEMPLATE_FIELDS

# 5. 实例化FastAPI APP（必须所有初始化逻辑完成后）
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="采购文件智能生成系统API"
)

# 跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常捕获（放在所有路由前面）
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": f"服务器内部错误：{str(exc)}",
            "data": None
        }
    )

# 6. 统一挂载全部路由（新旧分开，前缀不冲突）
# 新版前端V3.2 专用接口
app.include_router(template.router, prefix="/api", tags=["模板接口"])
app.include_router(ai.router, prefix="/api", tags=["AI解析接口"])
app.include_router(document.router, prefix="/api/tender-documents", tags=["文档生成接口"])
app.include_router(risk.router, prefix="/api/risk", tags=["合规风险接口"])

# 旧版保留接口（历史业务）
app.include_router(req_router, prefix="/api/requirements", tags=["需求解析模块"])
app.include_router(doc_router, prefix="/api/documents", tags=["旧文档处理模块"])
app.include_router(project.router, prefix="/api/v1/project", tags=["采购项目管理"])

# ===================== 旧兼容模型与接口（不动） =====================
class ProjectFullData(BaseModel):
    # 基础项目信息（前端必传）
    purchaseProjectName: str
    purchaseOrgName: str
    purchaseContactPerson: str
    purchaseContactPhone: str
    purchaseMethod: str
    purchaseCategory: str
    totalBudgetAmount: float
    fundSource: str | None = None
    deliveryAddress: str
    deliveryDeadline: str
    paymentMode: str
    warrantyPeriod: str

    # 招标专项字段【全部可选，不传不报错】
    projectCode: str | None = None
    legalRepresentative: str | None = None
    constructionLocation: str | None = None
    constructionScale: str | None = None
    structureType: str | None = None
    eavesHeight: str | None = None
    aboveGroundFloors: str | None = None
    undergroundFloors: str | None = None
    bidScope: str | None = None
    constructionPeriod: str | None = None
    planStartDate: str | None = None
    planEndDate: str | None = None
    qualityStandard: str | None = None
    qualificationRequirement: str | None = None
    siteVisitDate: str | None = None
    siteVisitTime: str | None = None
    siteVisitLocation: str | None = None
    bidValidPeriod: str | None = None
    bidBondAmount: str | None = None
    docCopyCount: str | None = None
    drawingDeposit: str | None = None
    submitLocation: str | None = None
    submitDeadlineDate: str | None = None
    submitDeadlineTime: str | None = None
    bidOpenDate: str | None = None
    bidOpenTime: str | None = None
    bidOpenLocation: str | None = None
    evaluationMethod: str | None = None
    contractType: str | None = None
    ceilingPrice: str | None = None
    reserveFund: str | None = None
    tendererAddress: str | None = None

# ===================== 旧兼容生成接口（不动） =====================
@app.post("/api/documents/generate-bid", summary="根据项目字段生成招标Word")
async def generate_bid_doc(project: ProjectFullData = Body(...)):
    if not os.path.exists(TEMPLATE_FILE):
        raise HTTPException(status_code=500, detail="模板缺失：template/bid_template_with_placeholders.docx")

    now = datetime.now()
    render_data = {
        "projectCode": project.projectCode or f"GC-ZB{now.year}-001",
        "projectName": project.purchaseProjectName,
        "tendererName": project.purchaseOrgName,
        "legalRepresentative": project.legalRepresentative or "",
        "issueYear": str(now.year),
        "issueMonth": str(now.month),
        "issueDay": str(now.day),

        "constructionLocation": project.constructionLocation or project.deliveryAddress,
        "constructionScale": project.constructionScale or "按需采购",
        "structureType": project.structureType or "货物类无",
        "eavesHeight": project.eavesHeight or "",
        "aboveGroundFloors": project.aboveGroundFloors or "0",
        "undergroundFloors": project.undergroundFloors or "0",
        "fundSource": project.fundSource or "企业自筹资金",

        "bidScope": project.bidScope or "清单内全部采购货物",
        "constructionPeriod": project.constructionPeriod or "30日历天",
        "planStartDate": project.planStartDate or f"{now.year}年{now.month+1}月1日",
        "planEndDate": project.planEndDate or f"{now.year}年{now.month+2}月1日",
        "qualityStandard": project.qualityStandard or "合格",
        "qualificationRequirement": project.qualificationRequirement or "具备对应货物经营资质",

        "siteVisitDate": project.siteVisitDate or "不组织现场踏勘",
        "siteVisitTime": project.siteVisitTime or "",
        "siteVisitLocation": project.siteVisitLocation or "",

        "bidValidPeriod": project.bidValidPeriod or "90日历日",
        "bidBondAmount": project.bidBondAmount or "0",
        "docCopyCount": project.docCopyCount or "正本1份，副本2份",
        "drawingDeposit": project.drawingDeposit or "0",

        "submitLocation": project.submitLocation or project.deliveryAddress,
        "submitDeadlineDate": project.submitDeadlineDate or f"{now.year}年{now.month+1}月15日",
        "submitDeadlineTime": project.submitDeadlineTime or "上午9:30",

        "bidOpenDate": project.bidOpenDate or f"{now.year}年{now.month+1}月15日",
        "bidOpenTime": project.bidOpenTime or "上午9:30",
        "bidOpenLocation": project.bidOpenLocation or "公司会议室",

        "evaluationMethod": project.evaluationMethod or "综合评分法",
        "contractType": project.contractType or "固定总价合同",
        "ceilingPrice": project.ceilingPrice or str(project.totalBudgetAmount),
        "reserveFund": project.reserveFund or "0",

        "tendererAddress": project.tendererAddress or project.deliveryAddress,
        "contactPerson": project.purchaseContactPerson,
        "contactPhone": project.purchaseContactPhone,
    }

    file_uid = str(uuid.uuid4())
    output_file = f"./output/招标书_{file_uid}.docx"
    engine = BidTemplateEngine(TEMPLATE_FILE)
    engine.render(render_data, output_file)

    return FileResponse(
        path=output_file,
        filename=f"{project.purchaseProjectName}_招标文件.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

# 模板占位符查询接口
@app.get("/api/template/placeholders", summary="查询招标模板所有占位符")
async def get_all_placeholder():
    if not os.path.exists(TEMPLATE_FILE):
        raise HTTPException(status_code=500, detail="模板文件不存在")
    engine = BidTemplateEngine(TEMPLATE_FILE)
    placeholder_list = engine.list_placeholders()
    res = []
    for key in placeholder_list:
        info = BID_TEMPLATE_FIELDS.get(key, {})
        res.append({
            "key": key,
            "placeholder": f"{{{{{key}}}}}",
            "label": info.get("label", key),
            "required": info.get("required", False),
        })
    return {"placeholders": res}

# 启动入口
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.APP_PORT, reload=True)