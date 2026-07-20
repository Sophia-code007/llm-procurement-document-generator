from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime
from datetime import datetime
from app.core.database import Base

class ProcurementProject(Base):
    __tablename__ = "procurement_project"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # 基础采购信息
    purchaseProjectName = Column(String(200), nullable=False, comment="采购项目名称")
    purchaseOrgName = Column(String(200), nullable=False, comment="采购组织单位")
    purchaseContactPerson = Column(String(50), nullable=False, comment="采购联系人")
    purchaseContactPhone = Column(String(20), nullable=False, comment="联系电话")
    purchaseMethod = Column(String(50), nullable=False, comment="采购方式")
    purchaseCategory = Column(String(50), nullable=False, comment="采购类别")
    totalBudgetAmount = Column(Numeric(18, 2), nullable=False, comment="预算总金额")
    fundSource = Column(String(100), nullable=True, comment="资金来源")

    # 采购清单（JSON字符串存储）
    purchaseItemList = Column(Text, nullable=False, comment="采购清单明细JSON数组")

    # 商务报价
    setMaxPriceLimit = Column(Boolean, default=False, nullable=False, comment="是否设置最高限价")
    maxPriceAmount = Column(Numeric(18, 2), nullable=True, comment="最高限价金额")
    quoteScope = Column(Text, nullable=True, comment="报价包含范围")
    taxRateRequire = Column(String(50), nullable=True, comment="税率要求")

    # 交付履约
    deliveryAddress = Column(String(500), nullable=False, comment="交付地点")
    deliveryDeadline = Column(String(100), nullable=False, comment="交付期限")
    acceptanceStandard = Column(Text, nullable=True, comment="验收标准")

    # 付款条款
    paymentMode = Column(String(50), nullable=False, comment="付款方式")
    advancePaymentRatio = Column(Numeric(5, 2), nullable=True, comment="预付款比例")
    finalPaymentTerm = Column(String(100), nullable=True, comment="尾款支付时限")

    # 质保售后
    warrantyPeriod = Column(String(100), nullable=False, comment="质保期限")
    afterServiceResponse = Column(Text, nullable=True, comment="售后响应要求")

    # 招标字段
    docObtainStartTime = Column(DateTime, nullable=True)
    docObtainEndTime = Column(DateTime, nullable=True)
    bidDeadline = Column(DateTime, nullable=True)
    bidOpenAddress = Column(String(500), nullable=True)
    needBidBond = Column(Boolean, default=False, nullable=True)
    bidBondAmount = Column(Numeric(18, 2), nullable=True)

    # 合规字段
    isGovernmentProcurement = Column(Boolean, default=False, nullable=False)
    allowSubcontract = Column(Boolean, default=False, nullable=True)
    ipOwnershipRequire = Column(Text, nullable=True)
    otherSpecialRequirement = Column(Text, nullable=True)

    # AI生成结果
    generatedDocContent = Column(Text, nullable=True, comment="AI生成采购文件")
    projectStatus = Column(String(50), default="draft", comment="项目状态 draft/finished")

    # 时间字段（无字符串BUG）
    createTime = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updateTime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")
