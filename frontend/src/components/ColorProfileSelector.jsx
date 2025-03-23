import { useState } from 'react';
import colorProfiles from '../utils/colorProfiles';
import axios from 'axios';

const ColorProfileSelector = ({ currentProfile, onProfileChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };
  
  const selectProfile = async (profileKey) => {
    if (profileKey === currentProfile) {
      setIsOpen(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Update user's color profile in the database
      await axios.patch('/api/users/update-color-profile', {
        colorProfile: profileKey
      });
      
      // Call the callback to update UI
      onProfileChange(profileKey);
      
      // Update in localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData.colorProfile = profileKey;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update color profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="color-profile-selector">
      <button 
        className="profile-selector-toggle" 
        onClick={toggleSelector}
        disabled={loading}
        style={{ color: '#000000' }}
      >
        <span 
          className="color-preview" 
          style={{ backgroundColor: colorProfiles[currentProfile].primary }}
        ></span>
        <span>{colorProfiles[currentProfile].name}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="profile-options">
          {Object.entries(colorProfiles).map(([key, profile]) => (
            <button
              key={key}
              className={`profile-option ${key === currentProfile ? 'active' : ''}`}
              onClick={() => selectProfile(key)}
              style={{ color: '#000000' }}
            >
              <span 
                className="color-preview" 
                style={{ backgroundColor: profile.primary }}
              ></span>
              <span>{profile.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorProfileSelector; 