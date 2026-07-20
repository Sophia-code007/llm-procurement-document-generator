# ===================== 系统基础配置 =====================
APP_NAME = "采购文件智能生成系统"
APP_PORT = 8000

# ===================== MySQL数据库 =====================
DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = "z123"
DB_NAME = "procurement_db"
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# ===================== 模板路径与映射（修复完整6模板、字段统一） =====================
TEMPLATE_ROOT = "./template"
TEMPLATE_MAP = [
    # 招标模板
    {"templateType": "engineering", "docType": "bid", "file": "engineering_bid.docx", "name": "工程类招标模板"},
    {"templateType": "goods", "docType": "bid", "file": "goods_bid.docx", "name": "货物类招标模板"},
    {"templateType": "service", "docType": "bid", "file": "service_bid.docx", "name": "服务类招标模板"},
    # 合同模板（补全缺失docType，格式统一）
    {"templateType": "engineering", "docType": "contract", "file": "engineering_contract.docx", "name": "工程采购合同"},
    {"templateType": "goods", "docType": "contract", "file": "goods_contract.docx", "name": "货物采购合同"},
    {"templateType": "service", "docType": "contract", "file": "service_contract.docx", "name": "服务采购合同"},
]

# ===================== DeepSeek大模型配置（彻底修复AI报错） =====================
LLM_API_KEY = "API_KEY"  # 替换为实际的DeepSeek API Key
LLM_BASE_URL = "https://api.deepseek.com/v1"
LLM_MODEL = "deepseek-chat"

# 统一配置类，全局导入用
class Settings:
    APP_NAME = APP_NAME
    APP_PORT = APP_PORT
    DB_HOST = DB_HOST
    DB_PORT = DB_PORT
    DB_USER = DB_USER
    DB_PASSWORD = DB_PASSWORD
    DB_NAME = DB_NAME
    DATABASE_URL = DATABASE_URL
    TEMPLATE_ROOT = TEMPLATE_ROOT
    TEMPLATE_MAP = TEMPLATE_MAP
    LLM_API_KEY = LLM_API_KEY
    LLM_BASE_URL = LLM_BASE_URL
    LLM_MODEL = LLM_MODEL

settings = Settings()