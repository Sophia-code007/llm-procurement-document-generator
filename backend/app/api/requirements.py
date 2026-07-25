from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.common import success_response
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services import project as project_service

router = APIRouter()

@router.post("/parse", summary="需求解析-创建采购项目")
def parse_requirement(info: ProjectCreate, db: Session = Depends(get_db)):
    obj = project_service.create_project(db, info)
    return success_response(data=ProjectResponse.from_orm(obj), message="创建成功")
