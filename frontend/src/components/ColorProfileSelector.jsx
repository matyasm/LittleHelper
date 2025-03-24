import { colorProfiles } from '../utils/colorProfiles';
import { FiCheckCircle } from 'react-icons/fi';

const ColorProfileSelector = ({ currentProfile, onChange, theme, displayStyle = 'dropdown' }) => {
  // Available color profiles
  const profileOptions = Object.keys(colorProfiles);
  
  // Handle profile change
  const handleChange = (selectedProfile) => {
    onChange(selectedProfile);
    localStorage.setItem('colorProfile', selectedProfile);
  };
  
  if (displayStyle === 'grid') {
    return (
      <div className="color-grid-selector" style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}>
        <div className="grid-header" style={{
          padding: '10px 15px',
          borderBottom: `1px solid ${theme.border}`,
          color: theme.text,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Theme Colors
        </div>
        
        <div className="color-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          padding: '12px',
        }}>
          {profileOptions.map(profile => (
            <div
              key={profile}
              className={`color-option ${currentProfile === profile ? 'active' : ''}`}
              onClick={() => handleChange(profile)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: currentProfile === profile ? `${theme.primary}10` : 'transparent',
                border: currentProfile === profile ? `1px solid ${theme.primary}30` : `1px solid ${theme.border}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div
                className="color-preview"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: colorProfiles[profile].primary,
                  border: `1px solid ${theme.border}`,
                  marginRight: '8px',
                  position: 'relative'
                }}
              >
                {currentProfile === profile && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontSize: '12px'
                  }}>
                    <FiCheckCircle size={10} />
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.text,
                fontWeight: currentProfile === profile ? '500' : 'normal',
              }}>
                {colorProfiles[profile].name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Default dropdown style
  return (
    <div className="color-profile-selector" style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <label 
        htmlFor="colorProfile"
        style={{ 
          color: theme.textLight,
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Theme:
      </label>
      
      <select
        id="colorProfile"
        value={currentProfile}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '4px',
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.background,
          color: theme.text,
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {profileOptions.map(profile => (
          <option 
            key={profile} 
            value={profile}
            style={{
              backgroundColor: theme.background,
              color: theme.text
            }}
          >
            {colorProfiles[profile].name}
          </option>
        ))}
      </select>
      
      {/* Color preview */}
      <div 
        className="color-preview"
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: colorProfiles[currentProfile].primary,
          border: `1px solid ${theme.border}`
        }}
      />
    </div>
  );
};

export default ColorProfileSelector; 