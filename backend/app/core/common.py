def success_response(data=None, message="操作成功", code=200):
    return {
        "code": code,
        "message": message,
        "data": data
    }

def error_response(message="操作失败", code=400, data=None):
    return {
        "code": code,
        "message": message,
        "data": data
    }
