import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChangePassword from './ChangePassword';
import { colorProfiles, getTheme } from '../utils/colorProfiles';
import NoteForm from './NoteForm';
import Note from './Note';
import { FiSearch, FiPlus, FiX, FiUser, FiLock, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';

// Utility function to adjust color brightness
const adjustColor = (color, amount) => {
  // Handle colors in hex format
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse the hex values
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    
    // Adjust the color
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Handle colors in rgb/rgba format
  if (color.startsWith('rgb')) {
    const isRgba = color.startsWith('rgba');
    const values = color.match(/\d+(\.\d+)?/g);
    
    if (!values || values.length < 3) return color;
    
    let r = parseFloat(values[0]);
    let g = parseFloat(values[1]);
    let b = parseFloat(values[2]);
    let a = isRgba && values.length > 3 ? parseFloat(values[3]) : 1;
    
    // Adjust the color
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Return the adjusted color
    return isRgba ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }
  
  // Return original color if format not supported
  return color;
};

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [colorProfile, setColorProfile] = useState(localStorage.getItem('colorProfile') || 'auroraBreeze');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card', 'compact', or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(getThemeByProfile(colorProfile));
  const [editingNote, setEditingNote] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('');
  
  // Reference for the profile menu dropdown
  const profileMenuRef = useRef(null);
  
  // Get current theme (makes the code more resilient)
  const getCurrentTheme = () => {
    const profile = localStorage.getItem('colorProfile') || colorProfile || 'auroraBreeze';
    const mode = localStorage.getItem('themeMode') || 'light';
    return getTheme(profile, mode);
  };
  
  // Fetch notes from the server - defined before it's used
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notes');
      const fetchedNotes = response.data || [];
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);

      // Also fetch tasks
      try {
        const tasksResponse = await axios.get('/api/tasks');
        setTasks(tasksResponse.data || []);
      } catch (taskError) {
        console.warn('Error fetching tasks:', taskError.message);
        if (taskError.code === 'ERR_NETWORK') {
          console.warn('Network error - make sure the backend is running on port 5001');
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error.message);
      if (error.code === 'ERR_NETWORK') {
        console.warn('Network error - make sure the backend is running on port 5001');
        // Still allow the app to run with empty notes in offline mode
        setNotes([]);
        setFilteredNotes([]);
      }
      if (error.response?.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('user');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Initialize user data and settings - now fetchNotes is defined before this is called
  const initializeUser = useCallback(() => {
    if (user) {
      setUsername(user.name);
      
      // First get color profile from localStorage (if any)
      const savedColorProfile = localStorage.getItem('colorProfile') || 'auroraBreeze';
      
      // If user has a profile, use it and save to localStorage
      if (user.colorProfile) {
        setColorProfile(user.colorProfile);
        localStorage.setItem('colorProfile', user.colorProfile);
      } else {
        // Otherwise use the one from localStorage
        setColorProfile(savedColorProfile);
      }
      
      // Apply the theme based on the selected profile and mode from localStorage
      const savedMode = localStorage.getItem('themeMode') || 'light';
      setTheme(getTheme(savedColorProfile, savedMode));
      
      fetchNotes();
    }
  }, [user, fetchNotes]);

  useEffect(() => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/');
      return;
    }
    
    // Set user data
    setUser(userData);
    
    // Set up auth headers for API calls
    if (userData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
    
    // Don't call fetchNotes here - it will be called by initializeUser after user is set
  }, [navigate]); // Don't include fetchNotes in the dependencies
  
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
    
    // Fetch notes and tasks using the fetchNotes function
    fetchNotes();
  }, [navigate, fetchNotes]);
  
  // Effect to initialize user data after user is set
  useEffect(() => {
    if (user) {
      initializeUser();
    }
  }, [user, initializeUser]);
  
  // Handle search query changes
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(lowercaseQuery) || 
        note.content.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredNotes(filtered);
    }
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
    
    // We'll no longer update profile here, this will be handled in a separate effect
  }, [colorProfile]);
  
  const handleColorProfileChange = (profile) => {
    setColorProfile(profile);
    setTheme(getThemeByProfile(profile));
    
    // Save to localStorage regardless of server update status
    localStorage.setItem('colorProfile', profile);
    
    // Update color profile in database (optional, won't block UI)
    // Only attempt update if a change has actually occurred
    if (profile !== colorProfile) {
      updateColorProfileInDatabase(profile);
    }
  };
  
  // Add a separate effect to update the color profile in DB whenever the user changes
  // or is logged in - this prevents unnecessary duplicate updates
  useEffect(() => {
    if (user && user.token) {
      // Get the current profile from localStorage
      const currentProfile = localStorage.getItem('colorProfile') || 'auroraBreeze';
      
      // Only update if user has loaded and we have a token
      const profileToUpdate = user.colorProfile !== currentProfile ? currentProfile : null;
      
      if (profileToUpdate) {
        console.log('Syncing color profile to server:', profileToUpdate);
        updateColorProfileInDatabase(profileToUpdate);
      }
    }
  }, [user]);
  
  // Map exotic themes to valid API values
  const exoticToApiThemeMap = {
    // Map exotic themes to the backend-supported themes
    auroraBreeze: 'blue',
    amethystDusk: 'purple',
    saharaSunset: 'orange',
    jadeForest: 'green',
    coralReef: 'red',
    oceanMist: 'teal',
    midnightOrchid: 'dark',
    alpineSnow: 'light',
    // Include the original themes as direct mappings
    blue: 'blue',
    purple: 'purple',
    green: 'green',
    orange: 'orange',
    red: 'red',
    teal: 'teal',
    dark: 'dark',
    light: 'light'
  };
  
  // Get API-compatible theme name
  const getApiThemeName = (profileName) => {
    return exoticToApiThemeMap[profileName] || 'blue'; // Default to blue if not found
  };
  
  // Separate function to update the profile in the database
  const updateColorProfileInDatabase = async (profile) => {
    try {
      // Convert exotic theme name to backend API compatible name
      const apiThemeName = getApiThemeName(profile);
      console.log(`Attempting to update color profile with: ${profile} (API name: ${apiThemeName})`);
      
      // Make sure user is authenticated
      if (!user || !user.token) {
        console.warn('Cannot update color profile: User not authenticated');
        return;
      }
      
      // Ensure authorization header is set
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      
      // Send the API-compatible theme name to the backend
      const response = await axios.patch('/api/users/update-color-profile', { 
        colorProfile: apiThemeName
      });
      
      console.log('Color profile updated in database:', profile);
      return response;
    } catch (error) {
      // Just log the error but don't show to user or block functionality
      if (error.code === 'ERR_NETWORK') {
        console.warn(`Could not save color profile to server: Network error - make sure the backend is running on port 5001.`);
      } else {
        console.warn('Could not save color profile to server (will use from localStorage):', error.message);
        // Add detailed error information
        if (error.response) {
          console.warn('Error details:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          });
          
          // Log the full response for debugging
          console.log('Full error response:', error.response);
        }
      }
      
      // Return null to indicate failure but don't throw - we'll use localStorage
      return null;
    }
  };
  
  useEffect(() => {
    // Update theme based on the selected color profile
    // This is a client-side operation and doesn't depend on the server
    const newTheme = getThemeByProfile(colorProfile);
    setTheme(newTheme);
    
    // We no longer update the profile to the database here as it's handled in the dedicated effect
  }, [colorProfile]);
  
  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  const togglePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal);
    // Close profile menu when opening password modal
    if (!showPasswordModal) {
      setShowProfileMenu(false);
    }
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
    if (!newNote || (!newNote._id && !newNote.id)) {
      console.error('Invalid note data received:', newNote);
      return;
    }
    
    // Ensure note has a consistent id field
    if (!newNote._id && newNote.id) {
      newNote._id = newNote.id;
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
  
  // Function to get a note ID (supporting both MongoDB _id and SQLite id)
  const getNoteId = (note) => note._id || note.id;

  const handleUpdateNote = useCallback((updatedNote) => {
    console.log('Updating note in state:', updatedNote);
    
    // Ensure note has a consistent id field
    if (!updatedNote._id && updatedNote.id) {
      updatedNote._id = updatedNote.id;
    }
    
    // Update in notes array
    setNotes(prevNotes => 
      prevNotes.map(note => 
        getNoteId(note) === getNoteId(updatedNote) ? updatedNote : note
      )
    );
    
    // Update in filtered notes if there's a search
    setFilteredNotes(prevNotes => 
      prevNotes.map(note => 
        getNoteId(note) === getNoteId(updatedNote) ? updatedNote : note
      )
    );
  }, []);

  const handleDeleteNote = useCallback((noteId) => {
    console.log('Deleting note from state:', noteId);
    setNotes(prevNotes => prevNotes.filter(note => getNoteId(note) !== noteId));
    setFilteredNotes(prevNotes => prevNotes.filter(note => getNoteId(note) !== noteId));
  }, []);
  
  // Function to handle data export
  const handleExport = () => {
    try {
      // Prepare the data to export
      const exportData = {
        notes,
        tasks,
        exportDate: new Date().toISOString(),
        userId: user.id || user._id,
        username: user.username,
        email: user.email
      };
      
      // Convert data to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `little-helper-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to handle data import
  const handleImport = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      setImportStatus({ status: 'loading', message: 'Importing data...' });
      
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Parse the JSON data
          const importedData = JSON.parse(e.target.result);
          
          if (!importedData.notes || !Array.isArray(importedData.notes)) {
            setImportStatus({ status: 'error', message: 'Invalid import file: No notes found' });
            return;
          }
          
          const importedNotes = importedData.notes;
          const importedTasks = importedData.tasks || [];
          
          // Filter out notes that already exist in the database
          // We'll consider a note as existing if it has the same title and content
          const existingTitlesAndContents = notes.map(note => `${note.title}-${note.content}`);
          const newNotes = importedNotes.filter(note => 
            !existingTitlesAndContents.includes(`${note.title}-${note.content}`)
          );
          
          // Get existing task titles for comparison
          const existingTaskTitles = tasks.map(task => task.title);
          const newTasks = importedTasks.filter(task => 
            !existingTaskTitles.includes(task.title)
          );
          
          // Import new notes
          let importedCount = 0;
          
          for (const note of newNotes) {
            try {
              const response = await axios.post('/api/notes', {
                title: note.title,
                content: note.content
              });
              
              if (response.data) {
                // Add the new note to state
                handleAddNote(response.data);
                importedCount++;
              }
            } catch (error) {
              console.error('Error importing note:', error);
            }
          }
          
          // Import new tasks
          let importedTaskCount = 0;
          
          for (const task of newTasks) {
            try {
              const response = await axios.post('/api/tasks', {
                title: task.title,
                completed: task.completed || false
              });
              
              if (response.data) {
                // Update tasks state (you should implement a handleAddTask function similar to handleAddNote)
                setTasks(prevTasks => [response.data, ...prevTasks]);
                importedTaskCount++;
              }
            } catch (error) {
              console.error('Error importing task:', error);
            }
          }
          
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          setImportStatus({ 
            status: 'success', 
            message: `Successfully imported ${importedCount} new notes and ${importedTaskCount} new tasks.`
          });
          
          // Clear the status after 5 seconds
          setTimeout(() => {
            setImportStatus(null);
          }, 5000);
          
        } catch (error) {
          console.error('Error parsing imported data:', error);
          setImportStatus({ status: 'error', message: 'Error parsing imported data' });
        }
      };
      
      reader.onerror = () => {
        setImportStatus({ status: 'error', message: 'Error reading file' });
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error importing data:', error);
      setImportStatus({ status: 'error', message: 'Error importing data' });
    }
  };
  
  // Toggle profile menu visibility
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  // Get theme based on color profile
  function getThemeByProfile(profile) {
    const mode = localStorage.getItem('themeMode') || 'light';
    return getTheme(profile, mode);
  }
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const newMode = currentTheme.mode === 'light' ? 'dark' : 'light';
    const newTheme = getTheme(colorProfile, newMode);
    setTheme(newTheme);
    localStorage.setItem('themeMode', newMode);
  };
  
  return (
    <div className="dashboard" style={{ 
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
      transition: 'all 0.3s ease',
    }}>
      <div className="top-bar" style={{ 
        backgroundColor: theme.cardBg, 
        borderBottom: `1px solid ${theme.border}`, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="app-title" style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ 
            fontSize: '22px', 
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            LittleHelper
          </span>
        </div>
        
        <div className="search-bar" style={{ 
          flex: '1',
          maxWidth: '500px',
          marginLeft: '20px',
          marginRight: '20px',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.mode === 'dark' ? `${theme.primary}10` : theme.background,
              color: theme.text,
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          />
          <FiSearch
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.primary,
              opacity: 0.7
            }}
          />
          {searchQuery && (
            <FiX
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: theme.textLight
              }}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        
        <div className="profile-section" style={{ position: 'relative' }} ref={profileMenuRef}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '15px'
          }}>            
            <button
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '20px',
                backgroundColor: `${theme.primary}15`,
                color: theme.primary,
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                  display: 'inline-block',
                  marginRight: '8px',
                }}
              ></span>
              <FiUser size={18} />
              <span style={{ fontSize: '15px' }}>{username}</span>
            </button>
          </div>
          
          {showProfileMenu && (
            <div 
              ref={profileMenuRef}
              className="profile-menu" 
              style={{
                position: 'absolute',
                top: '60px',
                right: '15px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '15px',
                zIndex: 1000,
                width: '280px',
                color: theme.text,
              }}
            >
              <div style={{ marginBottom: '10px', padding: '10px', borderRadius: '6px', backgroundColor: `${adjustColor(theme.background, 0.03)}` }}>
                <h3 style={{ marginBottom: '12px', color: theme.text, fontSize: '16px', fontWeight: 600 }}>
                  Hello, {username}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: theme.text,
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = adjustColor(theme.background, 0.06)}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiLock size={14} />
                    Change Password
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: theme.error,
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = adjustColor(theme.background, 0.06)}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '10px', 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 500 }}>Color Theme</h4>
                  <button
                    onClick={toggleTheme}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: theme.accent,
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = adjustColor(theme.background, 0.06)}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {theme.mode === 'light' ? <FiMoon size={14} /> : <FiSun size={14} />}
                    {theme.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}>
                  {Object.entries(colorProfiles).map(([key, profile]) => (
                    <div 
                      key={key}
                      onClick={() => handleColorProfileChange(key)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '6px',
                        padding: '2px',
                        border: colorProfile === key ? `2px solid ${theme.accent}` : '2px solid transparent',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <div style={{
                        height: '30px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, ${profile.primary}, ${profile.secondary})`,
                      }}
                        title={profile.name}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        padding: '20px',
        background: theme.mode === 'dark' 
          ? `linear-gradient(135deg, ${theme.background}, ${adjustColor(theme.background, 15)})`
          : `linear-gradient(135deg, ${theme.background}, ${adjustColor(theme.background, -5)})`,
        minHeight: 'calc(100vh - 115px)',
      }}>
        {activeTab === 'notes' && (
          <div className="notes-container" style={{ width: '100%' }}>
            <div className="notes-toolbar" style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.border,
              width: '100%',
              borderRadius: '12px',
              padding: '15px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div className="toolbar-left" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flex: '1',
                minWidth: '300px'
              }}>
                <button 
                  className="add-note-btn"
                  onClick={toggleAddNoteForm}
                  title="Add new note"
                  aria-label="Add new note"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <FiPlus size={16} />
                  <span>New Note</span>
                </button>
                
                {/* Export/Import Buttons */}
                <div className="data-management" style={{ 
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={handleExport}
                    title="Export notes and tasks"
                    style={{
                      backgroundColor: theme.mode === 'dark' ? `${theme.primary}15` : theme.cardBg,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export
                  </button>
                  
                  <button
                    onClick={triggerFileInput}
                    title="Import notes and tasks"
                    style={{
                      backgroundColor: theme.mode === 'dark' ? `${theme.primary}15` : theme.cardBg,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Import
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className="toolbar-right" style={{
                display: 'flex',
                gap: '10px'
              }}>
                <div 
                  className="view-mode-selector" 
                  style={{
                    display: 'flex',
                    backgroundColor: theme.mode === 'dark' ? `${theme.background}` : '#f5f6f7',
                    borderRadius: '6px',
                    padding: '3px',
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <button 
                    className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                    style={{ 
                      color: viewMode === 'card' ? '#fff' : theme.textLight,
                      backgroundColor: viewMode === 'card' ? theme.primary : 'transparent',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: viewMode === 'card' ? '500' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Card
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                    onClick={() => setViewMode('compact')}
                    style={{ 
                      color: viewMode === 'compact' ? '#fff' : theme.textLight,
                      backgroundColor: viewMode === 'compact' ? theme.primary : 'transparent',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: viewMode === 'compact' ? '500' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Compact
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    style={{ 
                      color: viewMode === 'list' ? '#fff' : theme.textLight,
                      backgroundColor: viewMode === 'list' ? theme.primary : 'transparent',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: viewMode === 'list' ? '500' : 'normal',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
            
            {/* Import Status Message */}
            {importStatus && (
              <div 
                className={`import-status-message ${importStatus.status} fade-in`}
                style={{
                  padding: '12px 16px',
                  margin: '0 0 20px 0',
                  borderRadius: '8px',
                  backgroundColor: importStatus.status === 'error' 
                    ? `${theme.error}15` 
                    : importStatus.status === 'success'
                    ? `${theme.success}15`
                    : `${theme.primary}15`,
                  color: importStatus.status === 'error'
                    ? theme.error
                    : importStatus.status === 'success'
                    ? theme.success
                    : theme.primary,
                  borderLeft: `4px solid ${
                    importStatus.status === 'error'
                      ? theme.error
                      : importStatus.status === 'success'
                      ? theme.success
                      : theme.primary
                  }`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {importStatus.status === 'error' ? '⚠️' : 
                   importStatus.status === 'success' ? '✅' : '⏳'}
                </span>
                {importStatus.message}
              </div>
            )}
            
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
                    key={getNoteId(note)} 
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
      
      {/* Password change modal */}
      {showPasswordModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            width: '90%',
            maxWidth: '450px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <ChangePassword 
              theme={theme} 
              onClose={togglePasswordModal} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;