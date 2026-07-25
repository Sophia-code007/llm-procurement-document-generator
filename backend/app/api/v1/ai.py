from fastapi import APIRouter, Depends
from pydantic import BaseModel
import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.common import success_response, error_response
from app.core.llm import llm_call

router = APIRouter(prefix="/ai", tags=["AI字段解析"])

# 请求体模型（修正字段为蛇形 template_type，和前端传参匹配，不再422）
class AiParseRequest(BaseModel):
    text: str
    template_type: str

@router.post("/parse", summary="AI自然语言字段解析")
def parse_natural_text(req: AiParseRequest):
    # 打印日志，判断接口是否正常进入（422时不会打印）
    print(f"【AI解析接口收到请求】模板类型：{req.template_type}，输入文本：{req.text[:100]}")
    try:
        # 调用大模型获取结构化JSON字符串（变量同步替换为 template_type）
        raw_json_str = llm_call(f"""
你是采购字段提取工具，只输出标准JSON，不要任何额外文字、注释、说明。
模板分类：{req.template_type}
字段说明：
engineering工程类字段：projectName、projectCode、tendererName、constructionLocation、constructionScale、structureType、aboveGroundFloors、undergroundFloors、fundSource、bidScope、constructionPeriod、planStartDate、planEndDate、qualityStandard、qualificationRequirement、bidBondAmount、contactPerson、contactPhone
goods货物类字段：projectName、tendererName、fundSource、deliveryAddress、deliveryDeadline、warrantyPeriod、paymentMode、taxRateRequire、totalBudgetAmount、itemList
service服务类字段：projectName、tendererName、fundSource、servicePeriod、responseRequire、paymentMode、totalBudgetAmount
输入采购需求文本：{req.text}
要求：无数据填空字符串''，数字填0，数组为空填[]，严格标准JSON格式，不能有多余字符。
""")
        print(f"【AI解析成功】大模型返回原始数据：{raw_json_str[:200]}")
        # 解析返回JSON
        data = json.loads(raw_json_str)
        return success_response(data=data)
    except Exception as e:
        print(f"【AI解析失败】错误详情：{str(e)}")
        return error_response(msg=f"大模型字段提取失败：{str(e)}")