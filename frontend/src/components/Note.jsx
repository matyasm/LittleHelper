import { useState } from 'react';
import axios from 'axios';
import SearchHighlight from './SearchHighlight';

const Note = ({ note, theme, viewMode, onNoteUpdated, onNoteDeleted, searchQuery = '', onEdit }) => {
  const [loading, setLoading] = useState(false);
  
  // Get the note ID (support both MongoDB _id and SQLite id)
  const getNoteId = () => note._id || note.id;
  
  // Handle note deletion
  const deleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const noteId = getNoteId();
      await axios.delete(`/api/notes/${noteId}`);
      
      // Call the parent callback
      if (onNoteDeleted) {
        onNoteDeleted(noteId);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date 
  const formatDate = (dateString) => {
    if (viewMode === 'list') {
      // For list view, show just month/day
      const options = { month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } else {
      // For other views, show more details
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  };
  
  // Truncate content based on view mode
  const getTruncatedContent = () => {
    if (viewMode === 'list') {
      // Show more content in list view since we have horizontal space
      return note.content.length > 120 ? `${note.content.substring(0, 120)}...` : note.content;
    } else if (viewMode === 'compact') {
      return note.content.length > 40 ? `${note.content.substring(0, 40)}...` : note.content;
    }
    return note.content;
  };
  
  // Highlight search terms
  const highlightSearchTerms = (text) => {
    if (!searchQuery || !text) return text;
    
    const query = searchQuery.toLowerCase();
    if (!text.toLowerCase().includes(query)) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query 
            ? <mark key={i} style={{ backgroundColor: 'rgba(255, 255, 0, 0.3)', padding: 0 }}>{part}</mark> 
            : <span key={i}>{part}</span>
        )}
      </>
    );
  };
  
  // Determine CSS classes based on view mode
  const getNoteClasses = () => {
    let classes = 'note';
    if (viewMode === 'card') classes += ' note-card';
    if (viewMode === 'compact') classes += ' note-compact';
    if (viewMode === 'list') classes += ' note-list';
    return classes;
  };
  
  return (
    <div 
      className={getNoteClasses()} 
      style={{ 
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
        color: theme.text
      }}
    >
      {viewMode === 'list' ? (
        // List view - horizontal layout
        <>
          <div className="note-header">
            <h3 style={{ color: theme.text }}>
              {highlightSearchTerms(note.title)}
            </h3>
          </div>
          
          <div className="note-content" style={{ color: theme.textLight }}>
            <p>{highlightSearchTerms(getTruncatedContent())}</p>
          </div>
          
          <div className="note-date" style={{ color: theme.textLight }}>
            {formatDate(note.updatedAt)}
          </div>
          
          <div className="note-actions">
            <button 
              onClick={onEdit} 
              className="icon-btn edit-btn"
              title="Edit note"
              aria-label="Edit note"
              style={{ color: theme.primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              onClick={deleteNote} 
              className="icon-btn delete-btn"
              title="Delete note"
              aria-label="Delete note"
              disabled={loading}
              style={{ color: theme.error }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </>
      ) : (
        // Card and Compact views - vertical layout
        <>
          <div className="note-header">
            <h3 style={{ color: theme.text }}>
              {highlightSearchTerms(note.title)}
            </h3>
            <div className="note-actions">
              <button 
                onClick={onEdit} 
                className="icon-btn edit-btn"
                title="Edit note"
                aria-label="Edit note"
                style={{ color: theme.primary }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                onClick={deleteNote} 
                className="icon-btn delete-btn"
                title="Delete note"
                aria-label="Delete note"
                disabled={loading}
                style={{ color: theme.error }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="note-content" style={{ color: theme.textLight }}>
            <p>{highlightSearchTerms(getTruncatedContent())}</p>
          </div>
          
          {viewMode !== 'list' && (
            <div className="note-footer" style={{ color: theme.textLight }}>
              <span>Created: {formatDate(note.createdAt)}</span>
              {note.updatedAt !== note.createdAt && (
                <span>Updated: {formatDate(note.updatedAt)}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Note; 