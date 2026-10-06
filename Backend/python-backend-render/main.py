import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Demo Python Backend trên Render")

# 1. CẤU HÌNH CORS (Bắt buộc để Frontend GitHub Pages gọi được)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Cho phép mọi domain gọi vào (hoặc thay bằng URL github.io)
    allow_credentials=True,
    allow_methods=["*"],       # Cho phép GET, POST, PUT, DELETE...
    allow_headers=["*"],
)

# 2. Định nghĩa kiểu dữ liệu cho POST request
class MessageData(BaseModel):
    text: str

# 3. Các API
@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Backend Python (FastAPI) đang chạy thành công trên Render!",
        "time": datetime.now().isoformat()
    }

@app.get("/api/users")
def get_users():
    return [
        {"id": 1, "name": "Nguyễn Văn A", "role": "Python Developer"},
        {"id": 2, "name": "Trần Thị B", "role": "Data Engineer"},
        {"id": 3, "name": "Lê Văn C", "role": "AI Engineer"}
    ]

@app.post("/api/message")
def receive_message(payload: MessageData):
    return {
        "status": "success",
        "reply": f"Backend Python nhận được tin nhắn: '{payload.text}'"
    }