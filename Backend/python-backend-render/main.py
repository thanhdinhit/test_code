from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Khởi tạo App với thông tin mô tả chi tiết
app = FastAPI(
    title="Demo Python Backend trên Render",
    description="Hệ thống API mẫu phục vụ kết nối Frontend (GitHub Pages)",
    version="1.1.0"
)

# 1. CẤU HÌNH CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế có thể thay bằng ["https://<username>.github.io"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. KHAI BÁO CÁC SCHEMA (PYDANTIC MODELS)
# ==========================================

class MessageData(BaseModel):
    text: str = Field(..., example="Xin chào server!")

class UserCreate(BaseModel):
    name: str = Field(..., example="Đinh Văn D")
    role: str = Field(..., example="DevOps Engineer")

class TodoCreate(BaseModel):
    title: str = Field(..., example="Học deploy GitHub Pages")

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

class CalculateRequest(BaseModel):
    num1: float = Field(..., example=10)
    num2: float = Field(..., example=5)
    operation: str = Field(..., example="add", description="add, subtract, multiply, divide")


# ==========================================
# 3. DỮ LIỆU TẠM THỜI (IN-MEMORY DATABASE)
# ==========================================

users_db = [
    {"id": 1, "name": "Nguyễn Văn A", "role": "Python Developer"},
    {"id": 2, "name": "Trần Thị B", "role": "Data Engineer"},
    {"id": 3, "name": "Lê Văn C", "role": "AI Engineer"}
]

todos_db = [
    {"id": 1, "title": "Deploy Backend lên Render", "completed": True},
    {"id": 2, "title": "Deploy Frontend lên GitHub Pages", "completed": False},
    {"id": 3, "title": "Kết nối API giữa 2 bên", "completed": False}
]


# ==========================================
# 4. DANH SÁCH CÁC API
# ==========================================

# --- Nhóm: Hệ thống & Kiểm tra ---
@app.get("/", tags=["System"])
def home():
    """Kiểm tra server sống hay chết"""
    return {
        "status": "success",
        "message": "Backend Python (FastAPI) đang hoạt động ổn định trên Render!",
        "time": datetime.now().isoformat()
    }

@app.get("/api/stats", tags=["System"])
def get_stats():
    """Lấy dữ liệu thống kê tổng quan (phù hợp làm Dashboard)"""
    return {
        "total_users": len(users_db),
        "total_todos": len(todos_db),
        "completed_todos": len([t for t in todos_db if t["completed"]]),
        "server_status": "healthy"
    }


# --- Nhóm: Quản lý Users ---
@app.get("/api/users", tags=["Users"])
def get_users(search: Optional[str] = Query(None, description="Tìm kiếm user theo tên hoặc role")):
    """Lấy danh sách user (có hỗ trợ tìm kiếm query: ?search=...)"""
    if search:
        search_lower = search.lower()
        filtered = [
            u for u in users_db 
            if search_lower in u["name"].lower() or search_lower in u["role"].lower()
        ]
        return filtered
    return users_db

@app.get("/api/users/{user_id}", tags=["Users"])
def get_user_detail(user_id: int):
    """Lấy thông tin chi tiết của 1 user theo ID"""
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng này")
    return user

@app.post("/api/users", status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(payload: UserCreate):
    """Thêm mới 1 user"""
    new_id = max([u["id"] for u in users_db], default=0) + 1
    new_user = {"id": new_id, "name": payload.name, "role": payload.role}
    users_db.append(new_user)
    return {"message": "Thêm user thành công!", "user": new_user}

@app.delete("/api/users/{user_id}", tags=["Users"])
def delete_user(user_id: int):
    """Xóa 1 user theo ID"""
    global users_db
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại để xóa")
    
    users_db = [u for u in users_db if u["id"] != user_id]
    return {"message": f"Đã xóa thành công user ID {user_id}"}


# --- Nhóm: Quản lý Công việc (Todo List CRUD) ---
@app.get("/api/todos", tags=["Todos"])
def get_todos(completed: Optional[bool] = Query(None, description="Lọc theo trạng thái hoàn thành")):
    """Lấy danh sách công việc (có thể lọc ?completed=true hoặc ?completed=false)"""
    if completed is not None:
        return [t for t in todos_db if t["completed"] == completed]
    return todos_db

@app.post("/api/todos", status_code=status.HTTP_201_CREATED, tags=["Todos"])
def add_todo(payload: TodoCreate):
    """Tạo một việc cần làm mới"""
    new_id = max([t["id"] for t in todos_db], default=0) + 1
    new_item = {"id": new_id, "title": payload.title, "completed": False}
    todos_db.append(new_item)
    return {"message": "Thêm việc cần làm thành công!", "todo": new_item}

@app.put("/api/todos/{todo_id}", tags=["Todos"])
def update_todo(todo_id: int, payload: TodoUpdate):
    """Cập nhật trạng thái hoặc tiêu đề công việc"""
    todo = next((t for t in todos_db if t["id"] == todo_id), None)
    if not todo:
        raise HTTPException(status_code=404, detail="Không tìm thấy việc cần làm")
    
    if payload.title is not None:
        todo["title"] = payload.title
    if payload.completed is not None:
        todo["completed"] = payload.completed
        
    return {"message": "Cập nhật thành công!", "todo": todo}

@app.delete("/api/todos/{todo_id}", tags=["Todos"])
def delete_todo(todo_id: int):
    """Xóa một công việc"""
    global todos_db
    todo = next((t for t in todos_db if t["id"] == todo_id), None)
    if not todo:
        raise HTTPException(status_code=404, detail="Không tìm thấy mục cần xóa")
    
    todos_db = [t for t in todos_db if t["id"] != todo_id]
    return {"message": f"Đã xóa thành công todo ID {todo_id}"}


# --- Nhóm: Tiện ích / Tính toán ---
@app.post("/api/message", tags=["Utilities"])
def receive_message(payload: MessageData):
    """Gửi tin nhắn phản hồi (Echo)"""
    return {
        "status": "success",
        "reply": f"Backend Python nhận được tin nhắn: '{payload.text}'"
    }

@app.post("/api/calculate", tags=["Utilities"])
def calculate(payload: CalculateRequest):
    """Tính toán 2 số cơ bản"""
    ops = {
        "add": payload.num1 + payload.num2,
        "subtract": payload.num1 - payload.num2,
        "multiply": payload.num1 * payload.num2,
    }
    
    if payload.operation == "divide":
        if payload.num2 == 0:
            raise HTTPException(status_code=400, detail="Không thể chia cho số 0")
        return {"result": payload.num1 / payload.num2}
    
    result = ops.get(payload.operation)
    if result is None:
        raise HTTPException(status_code=400, detail="Phép tính không hợp lệ (hỗ trợ: add, subtract, multiply, divide)")
        
    return {"operation": payload.operation, "result": result}