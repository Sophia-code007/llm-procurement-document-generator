from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.common import success_response, error_response
from app.schemas.project import ProjectUpdate, ProjectResponse
from app.services import project as project_service

router = APIRouter()

@router.get("", summary="项目列表")
def get_list(skip: int = Query(0), limit: int = Query(20), db: Session = Depends(get_db)):
    items = project_service.get_project_list(db, skip, limit)
    return success_response(data=[ProjectResponse.from_orm(i) for i in items])

@router.get("/{pid}", summary="项目详情")
def get_detail(pid: int, db: Session = Depends(get_db)):
    obj = project_service.get_project_by_id(db, pid)
    if not obj:
        return error_response("项目不存在")
    return success_response(data=ProjectResponse.from_orm(obj))

@router.put("/{pid}", summary="更新项目")
def update(pid: int, info: ProjectUpdate, db: Session = Depends(get_db)):
    obj = project_service.update_project(db, pid, info)
    if not obj:
        return error_response("更新失败，项目不存在")
    return success_response(data=ProjectResponse.from_orm(obj), message="更新成功")

@router.delete("/{pid}", summary="删除项目")
def delete(pid: int, db: Session = Depends(get_db)):
    if not project_service.delete_project(db, pid):
        return error_response("删除失败，项目不存在")
    return success_response(message="删除成功")
