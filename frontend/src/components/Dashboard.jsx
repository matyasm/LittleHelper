import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ColorProfileSelector from './ColorProfileSelector';
import ChangePassword from './ChangePassword';
import colorProfiles from '../utils/colorProfiles';
import NoteForm from './NoteForm';
import Note from './Note';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [colorProfile, setColorProfile] = useState('blue'); // Default color
  const [hoveredTab, setHoveredTab] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card', 'compact', or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState({
    primary: '#1976d2',
    background: '#f5f7fa',
    cardBg: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    error: '#d32f2f',
    success: '#388e3c'
  });
  const [editingNote, setEditingNote] = useState(null);
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
    
    // Set color profile from user data
    if (userData.colorProfile) {
      setColorProfile(userData.colorProfile);
    }
    
    // Set up auth headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    
    // Fetch user data
    const fetchData = async () => {
      try {
        const [notesResponse, tasksResponse] = await Promise.all([
          axios.get('/api/notes'),
          axios.get('/api/tasks')
        ]);
        
        // Initialize both state variables with the same data initially
        const fetchedNotes = notesResponse.data || [];
        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
        setTasks(tasksResponse.data || []);
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
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
    
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);
  
  useEffect(() => {
    // Define theme colors for each profile
    const themeColors = {
      blue: {
        primary: '#1976d2',
        background: '#f5f7fa',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      purple: {
        primary: '#7b1fa2',
        background: '#f8f5fd',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      green: {
        primary: '#388e3c',
        background: '#f5fbf6',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      orange: {
        primary: '#f57c00',
        background: '#fff9f5',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      red: {
        primary: '#d32f2f',
        background: '#fdf5f5',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      teal: {
        primary: '#00897b',
        background: '#f5fbfb',
        cardBg: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        border: '#e0e0e0',
        error: '#d32f2f',
        success: '#388e3c'
      },
      dark: {
        primary: '#2196f3',
        background: '#121212',
        cardBg: '#1e1e1e',
        text: '#e0e0e0',
        textLight: '#a0a0a0',
        border: '#333333',
        error: '#f44336',
        success: '#4caf50'
      },
      light: {
        primary: '#2196f3',
        background: '#ffffff',
        cardBg: '#f5f5f5',
        text: '#212121',
        textLight: '#757575',
        border: '#e0e0e0',
        error: '#f44336',
        success: '#4caf50'
      }
    };
    
    // Set the theme based on the selected color profile
    setTheme(themeColors[colorProfile] || themeColors.blue);
    
    // Update color profile in database
    const updateColorProfile = async () => {
      try {
        await axios.patch('/api/users/update-color-profile', { colorProfile });
      } catch (error) {
        console.error('Error updating color profile:', error);
      }
    };
    
    // Only update if user is logged in
    if (user && user.token) {
      updateColorProfile();
    }
  }, [colorProfile, user]);
  
  const handleColorProfileChange = (newProfile) => {
    setColorProfile(newProfile);
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  const togglePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal);
  };
  
  const toggleAddNoteForm = useCallback(() => {
    setEditingNote(null);
    setShowNoteForm(prevState => !prevState);
  }, []);
  
  const openEditNoteForm = useCallback((note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  }, []);
  
  const closeNoteForm = useCallback(() => {
    setShowNoteForm(false);
    setTimeout(() => {
      setEditingNote(null);
    }, 300);
  }, []);
  
  const handleAddNote = useCallback((newNote) => {
    console.log('Adding new note to state:', newNote);
    
    // Check if the note is valid
    if (!newNote || !newNote._id) {
      console.error('Invalid note data received:', newNote);
      return;
    }
    
    // Add to notes array
    setNotes(prevNotes => [newNote, ...prevNotes]);
    
    // Get the current search query from state
    const currentSearchQuery = searchQuery;
    
    // Update filtered notes based on current search
    if (!currentSearchQuery || currentSearchQuery.trim() === '') {
      // If no active search, add the new note to filtered notes too
      setFilteredNotes(prevNotes => [newNote, ...prevNotes]);
    } else {
      // If there's an active search, check if the new note matches
      const query = currentSearchQuery.toLowerCase();
      if (
        newNote.title.toLowerCase().includes(query) || 
        newNote.content.toLowerCase().includes(query)
      ) {
        setFilteredNotes(prevNotes => [newNote, ...prevNotes]);
      }
    }
  }, [searchQuery]);
  
  const handleUpdateNote = useCallback((updatedNote) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note._id === updatedNote._id ? updatedNote : note
      )
    );
    
    setFilteredNotes(prevNotes => 
      prevNotes.map(note => 
        note._id === updatedNote._id ? updatedNote : note
      )
    );
  }, []);
  
  const handleDeleteNote = useCallback((noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
    setFilteredNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
  }, []);
  
  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredNotes(notes);
      return;
    }
    
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) || 
      note.content.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredNotes(filtered);
  }, [notes]);
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Apply theme to root element for CSS variables
  document.documentElement.style.setProperty('--color-primary', theme.primary);
  document.documentElement.style.setProperty('--color-secondary', theme.secondary);
  document.documentElement.style.setProperty('--color-accent', theme.accent);
  document.documentElement.style.setProperty('--color-background', theme.background);
  document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
  document.documentElement.style.setProperty('--color-text', theme.text);
  document.documentElement.style.setProperty('--color-text-light', theme.textLight);
  document.documentElement.style.setProperty('--color-border', theme.border);
  document.documentElement.style.setProperty('--color-success', theme.success);
  document.documentElement.style.setProperty('--color-error', theme.error);
  
  const addAlpha = (color, opacity) => {
    // If color is already in rgba format
    if (color.startsWith('rgba')) {
      return color;
    }
    
    // If color is in hex format
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // If color is in rgb format
    if (color.startsWith('rgb(')) {
      const rgb = color.match(/\d+/g);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
    }
    
    // Default fallback
    return color;
  };
  
  return (
    <div className="dashboard" style={{ 
      backgroundColor: theme.background,
      width: '100%',
      maxWidth: '100%'
    }}>
      <div className="dashboard-header" style={{ 
        backgroundColor: theme.cardBg, 
        borderColor: theme.border,
        width: '100%'
      }}>
        <h1>Dashboard</h1>
        <div className="user-profile">
          <div className="color-profile-selector">
            <select
              value={colorProfile}
              onChange={(e) => setColorProfile(e.target.value)}
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text,
                borderColor: theme.border,
                padding: '5px 10px',
                borderRadius: '4px',
                marginRight: '15px'
              }}
            >
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
              <option value="teal">Teal</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          
          <div className="user-info" style={{ color: theme.text }}>
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email" style={{ color: theme.textLight }}>
              {user?.email || ''}
            </span>
          </div>
          
          <button 
            className="change-password-link"
            onClick={togglePasswordModal}
            style={{ color: theme.primary }}
          >
            Change Password
          </button>
          
          <button 
            className="logout-btn"
            onClick={logout}
            style={{ 
              backgroundColor: theme.error,
              color: '#fff'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="tab-navigation" style={{ 
        backgroundColor: theme.cardBg, 
        borderColor: theme.border,
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
            style={{ 
              color: activeTab === 'notes' ? theme.primary : theme.textLight,
              borderBottomColor: activeTab === 'notes' ? theme.primary : 'transparent'
            }}
          >
            Notes
          </button>
          <button 
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
            style={{ 
              color: activeTab === 'tasks' ? theme.primary : theme.textLight,
              borderBottomColor: activeTab === 'tasks' ? theme.primary : 'transparent'
            }}
          >
            Tasks
          </button>
        </div>
      </div>
      
      <div className="dashboard-content" style={{ 
        width: '100%', 
        maxWidth: '100%',
        padding: '20px'
      }}>
        {activeTab === 'notes' && (
          <div className="notes-container" style={{ width: '100%' }}>
            <div className="notes-toolbar" style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.border,
              width: '100%'
            }}>
              <div className="toolbar-left">
                <button 
                  className="add-note-btn icon-only"
                  onClick={toggleAddNoteForm}
                  title="Add new note"
                  aria-label="Add new note"
                  style={{ 
                    backgroundColor: theme.primary,
                    color: '#fff',
                    marginRight: '15px',
                    width: '36px',
                    height: '36px',
                    minWidth: '36px'
                  }}
                >
                  <span className="plus-icon">+</span>
                </button>
                
                <div className="search-container">
                  <input 
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ 
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
              </div>
              
              <div className="toolbar-right">
                <div className="view-mode-selector">
                  <button 
                    className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                    style={{ 
                      color: viewMode === 'card' ? theme.primary : theme.textLight,
                      borderColor: viewMode === 'card' ? theme.primary : 'transparent'
                    }}
                  >
                    Card
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                    onClick={() => setViewMode('compact')}
                    style={{ 
                      color: viewMode === 'compact' ? theme.primary : theme.textLight,
                      borderColor: viewMode === 'compact' ? theme.primary : 'transparent'
                    }}
                  >
                    Compact
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    style={{ 
                      color: viewMode === 'list' ? theme.primary : theme.textLight,
                      borderColor: viewMode === 'list' ? theme.primary : 'transparent'
                    }}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
            
            {/* Notes grid - full width */}
            <div 
              className={`notes-grid ${viewMode}`} 
              style={{ 
                width: '100%',
                backgroundColor: theme.background
              }}
            >
              {filteredNotes.length === 0 ? (
                <div className="empty-state" style={{ color: theme.textLight }}>
                  {searchQuery ? 
                    'No notes match your search.' : 
                    'No notes yet. Click the + button to create one.'}
                </div>
              ) : (
                filteredNotes.map(note => (
                  <Note 
                    key={note._id} 
                    note={note} 
                    theme={theme} 
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                    onNoteUpdated={handleUpdateNote}
                    onNoteDeleted={handleDeleteNote}
                    onEdit={() => openEditNoteForm(note)}
                  />
                ))
              )}
            </div>
            
            {/* Note Form Modal */}
            {showNoteForm && (
              <div 
                className="modal-overlay" 
                onClick={closeNoteForm}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
              >
                <div 
                  className="modal-content note-modal" 
                  onClick={e => e.stopPropagation()}
                >
                  <NoteForm 
                    theme={theme} 
                    note={editingNote}
                    onNoteAdded={handleAddNote} 
                    onNoteUpdated={handleUpdateNote}
                    onClose={closeNoteForm}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;