from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PurchaseItem(BaseModel):
    itemName: str
    itemModel: Optional[str] = None
    techRequirement: Optional[str] = None
    allowImportGoods: Optional[bool] = False

class ProjectCreate(BaseModel):
    purchaseProjectName: str
    purchaseOrgName: str
    purchaseContactPerson: str
    purchaseContactPhone: str
    purchaseMethod: str
    purchaseCategory: str
    totalBudgetAmount: float
    fundSource: Optional[str] = None
    purchaseItemList: List[PurchaseItem]
    setMaxPriceLimit: bool = False
    maxPriceAmount: Optional[float] = None
    quoteScope: Optional[str] = None
    taxRateRequire: Optional[str] = None
    deliveryAddress: str
    deliveryDeadline: str
    acceptanceStandard: Optional[str] = None
    paymentMode: str
    advancePaymentRatio: Optional[float] = None
    finalPaymentTerm: Optional[str] = None
    warrantyPeriod: str
    afterServiceResponse: Optional[str] = None
    docObtainStartTime: Optional[datetime] = None
    docObtainEndTime: Optional[datetime] = None
    bidDeadline: Optional[datetime] = None
    bidOpenAddress: Optional[str] = None
    needBidBond: Optional[bool] = False
    bidBondAmount: Optional[float] = None
    isGovernmentProcurement: bool = False
    allowSubcontract: Optional[bool] = False
    ipOwnershipRequire: Optional[str] = None
    otherSpecialRequirement: Optional[str] = None

class ProjectUpdate(BaseModel):
    purchaseProjectName: Optional[str] = None
    purchaseOrgName: Optional[str] = None
    purchaseContactPerson: Optional[str] = None
    purchaseContactPhone: Optional[str] = None
    purchaseMethod: Optional[str] = None
    purchaseCategory: Optional[str] = None
    totalBudgetAmount: Optional[float] = None
    fundSource: Optional[str] = None
    purchaseItemList: Optional[List[PurchaseItem]] = None
    setMaxPriceLimit: Optional[bool] = None
    maxPriceAmount: Optional[float] = None
    quoteScope: Optional[str] = None
    taxRateRequire: Optional[str] = None
    deliveryAddress: Optional[str] = None
    deliveryDeadline: Optional[str] = None
    acceptanceStandard: Optional[str] = None
    paymentMode: Optional[str] = None
    advancePaymentRatio: Optional[float] = None
    finalPaymentTerm: Optional[str] = None
    warrantyPeriod: Optional[str] = None
    afterServiceResponse: Optional[str] = None
    docObtainStartTime: Optional[datetime] = None
    docObtainEndTime: Optional[datetime] = None
    bidDeadline: Optional[datetime] = None
    bidOpenAddress: Optional[str] = None
    needBidBond: Optional[bool] = None
    bidBondAmount: Optional[float] = None
    isGovernmentProcurement: Optional[bool] = None
    allowSubcontract: Optional[bool] = None
    ipOwnershipRequire: Optional[str] = None
    otherSpecialRequirement: Optional[str] = None
    generatedDocContent: Optional[str] = None
    projectStatus: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    purchaseProjectName: str
    purchaseOrgName: str
    purchaseContactPerson: str
    purchaseContactPhone: str
    purchaseMethod: str
    purchaseCategory: str
    totalBudgetAmount: float
    fundSource: Optional[str]
    purchaseItemList: List[PurchaseItem]
    setMaxPriceLimit: bool
    maxPriceAmount: Optional[float]
    quoteScope: Optional[str]
    taxRateRequire: Optional[str]
    deliveryAddress: str
    deliveryDeadline: str
    acceptanceStandard: Optional[str]
    paymentMode: str
    advancePaymentRatio: Optional[float]
    finalPaymentTerm: Optional[str]
    warrantyPeriod: str
    afterServiceResponse: Optional[str]
    docObtainStartTime: Optional[datetime]
    docObtainEndTime: Optional[datetime]
    bidDeadline: Optional[datetime]
    bidOpenAddress: Optional[str]
    needBidBond: Optional[bool]
    bidBondAmount: Optional[float]
    isGovernmentProcurement: bool
    allowSubcontract: Optional[bool]
    ipOwnershipRequire: Optional[str]
    otherSpecialRequirement: Optional[str]
    generatedDocContent: Optional[str]
    projectStatus: str
    createTime: datetime
    updateTime: datetime

    class Config:
        from_attributes = True
