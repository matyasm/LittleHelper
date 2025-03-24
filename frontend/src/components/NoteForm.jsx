import { useState, useEffect } from 'react';
import axios from 'axios';

const NoteForm = ({ theme, note, onNoteAdded, onNoteUpdated, onClose }) => {
  // Initialize form data based on whether we're editing or creating
  const [formData, setFormData] = useState({
    title: note ? note.title : '',
    content: note ? note.content : ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { title, content } = formData;
  const isEditing = !!note; // Check if note is provided (editing mode)
  
  // Get the note ID (support both MongoDB _id and SQLite id)
  const getNoteId = () => note?._id || note?.id;
  
  // Reset form when note changes (switching between add/edit)
  useEffect(() => {
    setFormData({
      title: note ? note.title : '',
      content: note ? note.content : ''
    });
    setError('');
    setSuccess('');
  }, [note]);
  
  const onChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditing) {
        // Update existing note
        const noteId = getNoteId();
        console.log('Updating note:', { id: noteId, ...formData });
        
        const response = await axios.put(`/api/notes/${noteId}`, {
          title: title.trim(),
          content: content.trim()
        });
        
        console.log('Note update response:', response);
        
        if (response.data && response.status >= 200 && response.status < 300) {
          setSuccess('Note updated successfully!');
          
          // Call the callback with the updated note
          if (onNoteUpdated) {
            try {
              onNoteUpdated(response.data);
            } catch (callbackError) {
              console.error('Error in onNoteUpdated callback:', callbackError);
            }
          }
          
          // Close the form after a short delay
          setTimeout(() => {
            if (onClose) onClose();
          }, 800);
        }
      } else {
        // Create new note
        console.log('Creating new note:', formData);
        
        const response = await axios.post('/api/notes', {
          title: title.trim(),
          content: content.trim()
        });
        
        console.log('Note creation response:', response);
        
        if (response.data && response.status >= 200 && response.status < 300) {
          setSuccess('Note created successfully!');
          
          // Call the callback with the new note
          if (onNoteAdded) {
            try {
              onNoteAdded(response.data);
            } catch (callbackError) {
              console.error('Error in onNoteAdded callback:', callbackError);
            }
          }
          
          // Clear form if not closing
          setFormData({
            title: '',
            content: ''
          });
          
          // Close the form after a short delay
          setTimeout(() => {
            if (onClose) onClose();
          }, 800);
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} note:`, error);
      
      if (error.response) {
        setError(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setError('No response from server. Check your connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="note-form-container" style={{ 
      backgroundColor: theme.cardBg,
      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15)`,
      border: `1px solid ${theme.border}`
    }}>
      <div className="form-header" style={{ 
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: `${theme.primary}10`
      }}>
        <h2 style={{ 
          color: theme.primary,
          fontSize: '22px',
          fontWeight: '600'
        }}>
          {isEditing ? 'Edit Note' : 'Create New Note'}
        </h2>
        {onClose && (
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close"
            style={{ color: theme.textLight }}
          >
            &times;
          </button>
        )}
      </div>
      
      {error && (
        <div className="message error-message" style={{ 
          backgroundColor: `${theme.error}15`, 
          color: theme.error,
          borderLeft: `4px solid ${theme.error}`
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="message success-message" style={{ 
          backgroundColor: `${theme.success}15`, 
          color: theme.success,
          borderLeft: `4px solid ${theme.success}`
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title" style={{ color: theme.text }}>Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Note title"
            style={{ 
              borderColor: theme.border,
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content" style={{ color: theme.text }}>Content</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={onChange}
            placeholder="Note content"
            rows={12}
            style={{ 
              borderColor: theme.border,
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.05)`
            }}
          ></textarea>
        </div>
        
        <div className="form-actions">
          {onClose && (
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
              style={{ 
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.background
              }}
            >
              Cancel
            </button>
          )}
          
          <button 
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{ 
              backgroundColor: theme.primary,
              color: '#fff',
              boxShadow: `0 2px 4px ${theme.primary}40`
            }}
          >
            {loading ? 
              (isEditing ? 'Updating...' : 'Creating...') : 
              (isEditing ? 'Update Note' : 'Create Note')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm; 