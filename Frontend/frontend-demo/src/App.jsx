import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Thay URL backend Render của bạn vào đây (nhớ bỏ dấu / ở cuối)
  const [apiUrl, setApiUrl] = useState('https://<ten-backend-cua-ban>.onrender.com');
  const [stats, setStats] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Lấy dữ liệu Dashboard & Todos
  const fetchData = async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      const [resStats, resTodos] = await Promise.all([
        fetch(`${apiUrl}/api/stats`),
        fetch(`${apiUrl}/api/todos`)
      ]);
      const dataStats = await resStats.json();
      const dataTodos = await resTodos.json();
      setStats(dataStats);
      setTodos(dataTodos);
    } catch (err) {
      alert("Lỗi kết nối Backend! Hãy kiểm tra lại URL hoặc xem server Render có đang 'ngủ đông' không.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch nếu không phải URL mặc định
    if (!apiUrl.includes('<ten-backend')) {
      fetchData();
    }
  }, []);

  // 2. Thêm mới Todo (POST)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/api/todos`, {
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
      await fetch(`${apiUrl}/api/todos/${id}`, {
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
      await fetch(`${apiUrl}/api/todos/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <h2>🚀 Frontend Kết Nối Backend Render</h2>

      {/* Cấu hình URL */}
      <div style={{ marginBottom: 20 }}>
        <label><b>URL Backend:</b></label>
        <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
          <input 
            style={{ flex: 1, padding: 8 }}
            value={apiUrl} 
            onChange={(e) => setApiUrl(e.target.value)} 
          />
          <button onClick={fetchData} style={{ padding: '8px 16px' }}>Kết nối</button>
        </div>
      </div>

      {loading && <p style={{ color: '#0070f3' }}>⏳ Đang kết nối server (nếu server đang ngủ, vui lòng đợi 30s)...</p>}

      {/* Thống kê Stats */}
      {stats && (
        <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 20 }}>
          <h4>📊 Thống kê Backend:</h4>
          <p>Tổng Users: <b>{stats.total_users}</b> | Tổng Todos: <b>{stats.total_todos}</b> | Trạng thái: <b>{stats.server_status}</b></p>
        </div>
      )}

      {/* Danh sách Todo List */}
      <div>
        <h3>📝 Quản lý Công Việc (CRUD API):</h3>
        <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
          <input 
            style={{ flex: 1, padding: 8 }}
            placeholder="Nhập việc cần làm..." 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
          />
          <button type="submit" style={{ padding: '8px 16px' }}>Thêm</button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((item) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
              <span 
                onClick={() => handleToggleTodo(item.id, item.completed)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'gray' : 'black'
                }}
              >
                {item.completed ? '✅' : '⬜'} {item.title}
              </span>
              <button onClick={() => handleDeleteTodo(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
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