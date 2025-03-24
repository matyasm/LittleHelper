import { useState } from 'react';
import axios from 'axios';
import { FiLock, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';

const ChangePassword = ({ theme, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const { currentPassword, newPassword, confirmPassword } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Calculate password strength for new password
    if (e.target.name === 'newPassword') {
      calculatePasswordStrength(e.target.value);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }
    
    // Simple password strength calculation
    let score = 0;
    
    // Check length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Check for different character types
    if (/[a-z]/.test(password)) score += 1; // lowercase letters
    if (/[A-Z]/.test(password)) score += 1; // uppercase letters
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters
    
    let message = '';
    let color = '';
    
    // Set message and color based on score
    switch (true) {
      case (score <= 2):
        message = 'Weak';
        color = theme.error || '#d32f2f';
        break;
      case (score <= 4):
        message = 'Medium';
        color = '#ff9800';
        break;
      case (score <= 6):
        message = 'Strong';
        color = theme.success || '#4caf50';
        break;
      default:
        message = '';
    }
    
    setPasswordStrength({ score, message, color });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError('New password is too weak. It should include uppercase letters, lowercase letters, numbers, and special characters.');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.patch('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      
      setSuccess(response.data.message);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, message: '', color: '' });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Password change error:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="change-password-form" style={{ width: '100%' }}>
      <div className="form-header" style={{ 
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiKey size={20} style={{ color: theme.primary }} />
          <h2 style={{ 
            color: theme.text,
            margin: 0, 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Change Password
          </h2>
        </div>
        <button 
          className="close-btn" 
          onClick={onClose}
          style={{ 
            color: theme.textLight,
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          &times;
        </button>
      </div>
      
      <div className="form-body" style={{ padding: '20px' }}>
        {error && (
          <div 
            className="error-message fade-in" 
            style={{ 
              backgroundColor: `${theme.error}15`, 
              color: theme.error,
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: `4px solid ${theme.error}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div 
            className="success-message fade-in" 
            style={{ 
              backgroundColor: `${theme.success}15`, 
              color: theme.success,
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: `4px solid ${theme.success}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {success}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="currentPassword"
              style={{ 
                color: theme.text,
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={onChange}
                required
                style={{ 
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  color: theme.textLight,
                  cursor: 'pointer'
                }}
              >
                {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="newPassword"
              style={{ 
                color: theme.text,
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={onChange}
                required
                style={{ 
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${passwordStrength.message ? passwordStrength.color + '50' : theme.border}`,
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  color: theme.textLight,
                  cursor: 'pointer'
                }}
              >
                {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            
            {passwordStrength.message && (
              <div className="password-strength" style={{ 
                fontSize: '13px', 
                marginTop: '8px',
                color: passwordStrength.color,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Password strength: {passwordStrength.message}</span>
                  <span style={{ fontSize: '12px' }}>
                    {passwordStrength.score}/6
                  </span>
                </div>
                <div className="strength-bar" style={{ 
                  height: '6px', 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(passwordStrength.score / 6) * 100}%`,
                    backgroundColor: passwordStrength.color,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="confirmPassword"
              style={{ 
                color: theme.text,
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
                style={{ 
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${confirmPassword && newPassword !== confirmPassword ? theme.error : theme.border}`,
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  color: theme.textLight,
                  cursor: 'pointer'
                }}
              >
                {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            
            {confirmPassword && newPassword !== confirmPassword && (
              <div style={{ 
                color: theme.error, 
                fontSize: '13px', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Passwords do not match
              </div>
            )}
          </div>
          
          <div className="form-actions" style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                padding: '10px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              disabled={loading || newPassword !== confirmPassword || passwordStrength.score < 3}
              style={{ 
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: '#fff',
                cursor: loading || newPassword !== confirmPassword || passwordStrength.score < 3 ? 'not-allowed' : 'pointer',
                opacity: loading || newPassword !== confirmPassword || passwordStrength.score < 3 ? 0.7 : 1,
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiLock size={16} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 