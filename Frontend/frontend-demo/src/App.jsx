import { useState, useEffect } from 'react';
import './App.css';

// 👉 BƯỚC DUY NHẤT: Thay đường dẫn backend Render thật của bạn vào đây (bỏ dấu / ở cuối)
const API_URL = 'https://test-code-frg7.onrender.com';

function App() {
  const [stats, setStats] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  
  // Trạng thái kết nối
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Tự động lấy dữ liệu từ Backend khi load trang
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [resStats, resTodos] = await Promise.all([
        fetch(`${API_URL}/api/stats`),
        fetch(`${API_URL}/api/todos`)
      ]);

      if (!resStats.ok || !resTodos.ok) {
        throw new Error('Lỗi phản hồi từ máy chủ');
      }

      const dataStats = await resStats.json();
      const dataTodos = await resTodos.json();

      setStats(dataStats);
      setTodos(dataTodos);
      setIsConnected(true);
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      setErrorMsg("Không thể kết nối đến Backend. Nếu dùng gói miễn phí của Render, server có thể đang khởi động lại (mất khoảng 30-50s).");
    } finally {
      setLoading(false);
    }
  };

  // Gọi tự động ngay khi mở web
  useEffect(() => {
    fetchData();
  }, []);

  // 2. Thêm mới Todo (POST)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo })
      });
      if (res.ok) {
        setNewTodo('');
        fetchData(); // Tải lại danh sách
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Đổi trạng thái hoàn thành (PUT)
  const handleToggleTodo = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Xóa Todo (DELETE)
  const handleDeleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <h2>🚀 Quản Lý Dữ Liệu (Fullstack Auto Connect)</h2>

      {/* Thanh thông báo trạng thái kết nối tự động */}
      <div style={{ 
        padding: '10px 15px', 
        borderRadius: 6, 
        marginBottom: 20,
        backgroundColor: loading ? '#fff3cd' : (isConnected ? '#d1e7dd' : '#f8d7da'),
        color: loading ? '#856404' : (isConnected ? '#0f5132' : '#842029'),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          {loading && "⏳ Đang kết nối server Render (vui lòng chờ)..."}
          {!loading && isConnected && "🟢 Đã kết nối tự động với Backend thành công!"}
          {!loading && !isConnected && `🔴 ${errorMsg}`}
        </span>
        {!loading && !isConnected && (
          <button onClick={fetchData} style={{ padding: '4px 10px', cursor: 'pointer' }}>
            Thử lại
          </button>
        )}
      </div>

      {/* Thống kê Stats Dashboard */}
      {stats && (
        <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 20, border: '1px solid #eee' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📊 Thống kê Backend:</h4>
          <p style={{ margin: 0 }}>
            Tổng Users: <b>{stats.total_users}</b> | Tổng Todos: <b>{stats.total_todos}</b> | Server: <b>{stats.server_status}</b>
          </p>
        </div>
      )}

      {/* Danh sách Todo List CRUD */}
      <div>
        <h3>📝 Quản lý Công Việc:</h3>
        <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
          <input 
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            placeholder="Nhập việc cần làm..." 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
            disabled={!isConnected}
          />
          <button type="submit" disabled={!isConnected} style={{ padding: '8px 16px', cursor: isConnected ? 'pointer' : 'not-allowed' }}>
            Thêm
          </button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((item) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span 
                onClick={() => handleToggleTodo(item.id, item.completed)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? '#888' : '#000'
                }}
              >
                {item.completed ? '✅' : '⬜'} {item.title}
              </span>
              <button 
                onClick={() => handleDeleteTodo(item.id)} 
                style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;