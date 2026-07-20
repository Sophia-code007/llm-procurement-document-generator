import json
from sqlalchemy.orm import Session
from app.models.project import ProcurementProject
from app.schemas.project import ProjectCreate, ProjectUpdate


def create_project(db: Session, project_in: ProjectCreate):
    data = project_in.dict()
    # 列表转JSON字符串存入数据库
    data["purchaseItemList"] = json.dumps(
        [i.dict() for i in project_in.purchaseItemList],
        ensure_ascii=False
    )
    db_obj = ProcurementProject(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    # 脱离会话，再修改为列表，避免污染数据库
    db.expunge(db_obj)
    db_obj.purchaseItemList = json.loads(db_obj.purchaseItemList)
    return db_obj


def get_project_by_id(db: Session, pid: int):
    obj = db.query(ProcurementProject).filter(ProcurementProject.id == pid).first()
    if obj:
        # 脱离会话，修改属性不会被提交到数据库
        db.expunge(obj)
        obj.purchaseItemList = json.loads(obj.purchaseItemList)
    return obj


def get_project_list(db: Session, skip: int = 0, limit: int = 20):
    items = db.query(ProcurementProject).offset(skip).limit(limit).all()
    result = []
    for item in items:
        db.expunge(item)
        item.purchaseItemList = json.loads(item.purchaseItemList)
        result.append(item)
    return result


def update_project(db: Session, pid: int, project_in: ProjectUpdate):
    db_obj = db.query(ProcurementProject).filter(ProcurementProject.id == pid).first()
    if not db_obj:
        return None
    update_data = project_in.dict(exclude_unset=True)
    # 如果更新了采购清单，转成字符串再存
    if "purchaseItemList" in update_data and update_data["purchaseItemList"]:
        update_data["purchaseItemList"] = json.dumps(
            [i.dict() for i in update_data["purchaseItemList"]],
            ensure_ascii=False
        )
    for k, v in update_data.items():
        setattr(db_obj, k, v)
    db.commit()
    db.refresh(db_obj)
    # 返回前脱离会话，转成列表
    db.expunge(db_obj)
    db_obj.purchaseItemList = json.loads(db_obj.purchaseItemList)
    return db_obj


def delete_project(db: Session, pid: int):
    db_obj = db.query(ProcurementProject).filter(ProcurementProject.id == pid).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
