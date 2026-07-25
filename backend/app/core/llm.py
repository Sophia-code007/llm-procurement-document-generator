from openai import OpenAI
from app.core.config import settings
import json

# 从实例读取配置，不会受模块加载顺序影响
LLM_API_KEY = settings.LLM_API_KEY
LLM_BASE_URL = settings.LLM_BASE_URL
LLM_MODEL = settings.LLM_MODEL

# 启动时打印密钥校验日志，终端直接看是否读取成功
print("===== DeepSeek 配置校验 =====")
print(f"密钥长度：{len(LLM_API_KEY)}")
print(f"接口地址：{LLM_BASE_URL}")
print(f"模型名称：{LLM_MODEL}")

# 密钥合法性校验，启动直接抛错，不会静默失效
if not LLM_API_KEY or len(LLM_API_KEY.strip()) < 10:
    raise RuntimeError("DeepSeek API密钥配置无效，请检查config.py中的LLM_API_KEY")

# 客户端仅在配置合法后初始化
client = OpenAI(
    api_key=LLM_API_KEY,
    base_url=LLM_BASE_URL
)

def generate_procurement_file(project):
    """根据项目实体生成完整采购询价文档正文（旧项目接口使用）"""
    item_list = project.purchaseItemList
    if isinstance(item_list, str):
        item_list = json.loads(item_list)

    data = {
        "采购项目名称": project.purchaseProjectName,
        "采购单位": project.purchaseOrgName,
        "联系人": project.purchaseContactPerson,
        "联系电话": project.purchaseContactPhone,
        "采购方式": project.purchaseMethod,
        "采购类别": project.purchaseCategory,
        "预算金额": float(project.totalBudgetAmount),
        "资金来源": project.fundSource,
        "采购清单": item_list,
        "最高限价": float(project.maxPriceAmount) if project.setMaxPriceLimit else "无",
        "交付地点": project.deliveryAddress,
        "交付时间": project.deliveryDeadline,
        "验收标准": project.acceptanceStandard,
        "付款方式": project.paymentMode,
        "质保要求": project.warrantyPeriod,
        "售后要求": project.afterServiceResponse,
        "其他要求": project.otherSpecialRequirement
    }
    prompt = json.dumps(data, ensure_ascii=False)
    print(f"[文档生成] 发起DeepSeek调用，项目：{data['采购项目名称']}")

    res = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": """你是资深政府采购文件编制专家，需根据用户提供的项目信息，生成一份完整、规范、详实的正式询价采购文件。
要求：
1. 文件结构完整，至少包含以下章节：
第一章 采购公告
第二章 投标人须知
第三章 采购需求及技术规格要求
第四章 合同主要条款
第五章 评审办法及成交原则
第六章 报价文件格式及组成
第七章 附件与其他说明
2. 每个章节需细分条款，内容饱满详实，符合政府采购制式规范，禁止过度精简，整体篇幅对应Word标准排版（宋体小四、1.5倍行距）约15页。
3. 所有条款需结合项目信息填充具体内容，技术要求、验收标准、售后条款、违约责任等需细化展开，不可一笔带过。
4. 纯正文输出，使用中文标准文书格式，分章节分条款编号，禁止使用markdown、代码块、多余解释。"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=False
    )
    print("[文档生成] DeepSeek调用完成")
    return res.choices[0].message.content.strip()

def llm_call(prompt: str):
    """通用大模型调用函数，供 ai.py 自然语言字段提取使用，强制返回JSON"""
    print(f"[AI文本解析] 发起DeepSeek调用，输入片段：{prompt[:80]}...")
    try:
        res = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            response_format={"type": "json_object"}
        )
        print("[AI文本解析] DeepSeek调用成功，正常返回JSON")
        return res.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI文本解析] DeepSeek调用失败，错误详情：{str(e)}")
        # 抛出异常给到接口，前端可捕获报错，不会静默无响应
        raise Exception(f"大模型解析失败：{str(e)}")