import { useState } from 'react';
import axios from 'axios';

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
  
  const { currentPassword, newPassword, confirmPassword } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Calculate password strength for new password
    if (e.target.name === 'newPassword') {
      calculatePasswordStrength(e.target.value);
    }
  };
  
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }
    
    // Assess password strength
    const lengthScore = password.length >= 8 ? 1 : 0;
    const uppercaseScore = /[A-Z]/.test(password) ? 1 : 0;
    const lowercaseScore = /[a-z]/.test(password) ? 1 : 0;
    const numberScore = /[0-9]/.test(password) ? 1 : 0;
    const specialScore = /[^A-Za-z0-9]/.test(password) ? 1 : 0;
    
    const score = lengthScore + uppercaseScore + lowercaseScore + numberScore + specialScore;
    
    let message = '';
    let color = '';
    
    switch (score) {
      case 0:
      case 1:
        message = 'Very weak';
        color = '#e53e3e'; // red
        break;
      case 2:
        message = 'Weak';
        color = '#dd6b20'; // orange
        break;
      case 3:
        message = 'Moderate';
        color = '#d69e2e'; // yellow
        break;
      case 4:
        message = 'Strong';
        color = '#38a169'; // green
        break;
      case 5:
        message = 'Very strong';
        color = '#2b6cb0'; // blue
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
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="change-password-modal" style={{ backgroundColor: theme.cardBg }}>
      <div className="modal-header" style={{ borderBottomColor: theme.border }}>
        <h2 style={{ color: theme.text }}>Change Password</h2>
        <button 
          className="close-btn" 
          onClick={onClose}
          style={{ color: theme.textLight }}
        >
          &times;
        </button>
      </div>
      
      <div className="modal-body">
        {error && <div className="error-message" style={{ backgroundColor: theme.error + '20', color: theme.error }}>{error}</div>}
        {success && <div className="success-message" style={{ backgroundColor: theme.success + '20', color: theme.success }}>{success}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label 
              htmlFor="currentPassword"
              style={{ color: theme.text }}
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={onChange}
              required
              style={{ 
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text
              }}
            />
          </div>
          
          <div className="form-group">
            <label 
              htmlFor="newPassword"
              style={{ color: theme.text }}
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={onChange}
              required
              style={{ 
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text
              }}
            />
            {newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-indicator" 
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <p style={{ color: passwordStrength.color }}>
                  Password strength: {passwordStrength.message}
                </p>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label 
              htmlFor="confirmPassword"
              style={{ color: theme.text }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              style={{ 
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text
              }}
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="password-mismatch" style={{ color: theme.error }}>
                Passwords do not match
              </p>
            )}
          </div>
          
          <button 
            type="submit"
            className="submit-btn"
            disabled={loading || newPassword !== confirmPassword || passwordStrength.score < 3}
            style={{ 
              backgroundColor: theme.primary,
              color: '#ffffff',
              opacity: loading || newPassword !== confirmPassword || passwordStrength.score < 3 ? 0.7 : 1
            }}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 