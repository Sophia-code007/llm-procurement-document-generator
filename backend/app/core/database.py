from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# MySQL 连接地址直接读取配置类
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 获取数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 启动自动创建3张扩展业务表 MySQL语法
def create_extend_tables():
    with engine.connect() as conn:
        # 模板信息表
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS template_info (
            id INT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
            template_type VARCHAR(32) NOT NULL COMMENT '模板分类 engineering/goods/service',
            doc_type VARCHAR(16) NOT NULL COMMENT 'bid招标 / contract合同',
            name VARCHAR(100) NOT NULL COMMENT '模板名称',
            file_path VARCHAR(255) NOT NULL COMMENT 'docx模板路径',
            create_time DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模板清单表';
        """))

        # 文档生成任务表
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS procurement_task (
            task_id VARCHAR(64) PRIMARY KEY COMMENT 'UUID任务唯一ID',
            template_type VARCHAR(32) NOT NULL,
            doc_type VARCHAR(16) NOT NULL,
            source VARCHAR(16) NOT NULL COMMENT '录入来源 ai / form',
            form_data TEXT COMMENT '前端表单JSON字符串',
            status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/processing/completed/failed',
            progress INT DEFAULT 0 COMMENT '生成进度0-100',
            file_path VARCHAR(255) NULL COMMENT '生成文件保存路径',
            error_msg TEXT NULL COMMENT '失败错误信息',
            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            complete_time DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件生成任务表';
        """))

        # 合规风险检测记录表
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS risk_record (
            id INT PRIMARY KEY AUTO_INCREMENT,
            task_id VARCHAR(64) NULL COMMENT '关联生成任务ID',
            doc_text LONGTEXT COMMENT '原始文档全文',
            risk_result TEXT COMMENT 'AI识别风险JSON结果',
            create_time DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合规风险记录表';
        """))
        conn.commit()