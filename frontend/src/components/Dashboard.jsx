import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // Default to 'notes' tab
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/');
      return;
    }
    
    // Set user data
    setUser(userData);
    
    // Set up auth headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    
    // Fetch user data
    const fetchData = async () => {
      try {
        const [notesResponse, tasksResponse] = await Promise.all([
          axios.get('/api/notes'),
          axios.get('/api/tasks')
        ]);
        
        setNotes(notesResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          // Unauthorized - token expired or invalid
          localStorage.removeItem('user');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-profile">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name || user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
          )}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'notes' && (
          <div className="notes-section">
            <div className="section-header">
              <h2>Your Notes</h2>
              <button className="add-btn">+ Add Note</button>
            </div>
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>No notes found. Start creating!</p>
              </div>
            ) : (
              <ul className="notes-list">
                {notes.map((note) => (
                  <li key={note._id} className="note-card">
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2>Your Tasks</h2>
              <button className="add-btn">+ Add Task</button>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found. Start creating!</p>
              </div>
            ) : (
              <ul className="tasks-list">
                {tasks.map((task) => (
                  <li key={task._id} className="task-item">
                    <div className="task-checkbox">
                      <input 
                        type="checkbox" 
                        id={`task-${task._id}`}
                        checked={task.completed}
                        readOnly
                      />
                      <label htmlFor={`task-${task._id}`} className={task.completed ? 'completed' : ''}>
                        {task.title}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 