from fastapi import APIRouter
import os
from app.core.config import TEMPLATE_ROOT, TEMPLATE_MAP

router = APIRouter(prefix="/templates", tags=["模板管理"])

@router.get("/list")
def get_template_list():
    res = []
    for item in TEMPLATE_MAP:
        full_path = os.path.join(TEMPLATE_ROOT, item["file"])
        res.append({
            "templateType": item["templateType"],
            "docType": item["docType"],
            "name": item["name"],
            "exist": os.path.exists(full_path)
        })
    return {"code": 200, "msg": "success", "data": res}