import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });
  const navigate = useNavigate();

  const { email, password, passwordConfirm, username } = formData;

  // Calculate password strength whenever password changes
  useEffect(() => {
    if (!password || isLogin) {
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
  }, [password, isLogin]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const validatePassword = () => {
    // Check if passwords match
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (passwordStrength.score < 3) {
      setError('Password is too weak. It should have at least 8 characters and include uppercase letters, lowercase letters, numbers, and special characters.');
      return false;
    }
    
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      if (isLogin) {
        // Login
        const response = await axios.post('/api/users/login', { email, password });
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Register - first validate password
        if (!validatePassword()) {
          setLoading(false);
          return;
        }
        
        const response = await axios.post('/api/db/create-test-user', {
          email,
          password,
          username,
          name: username // Use username as name if API requires it
        });
        
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setFormData((prevState) => ({
          ...prevState,
          password: '',
          passwordConfirm: ''
        }));
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        (isLogin ? 'Login failed' : 'Registration failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    // Reset password fields when toggling
    setFormData((prevState) => ({
      ...prevState,
      password: '',
      passwordConfirm: ''
    }));
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Choose a username"
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter your password"
            required
          />
          
          {!isLogin && passwordStrength.message && (
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
        
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={onChange}
              placeholder="Confirm your password"
              required
            />
            {password && passwordConfirm && password !== passwordConfirm && (
              <p className="password-mismatch">Passwords do not match</p>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading || (!isLogin && (
            password !== passwordConfirm || 
            passwordStrength.score < 3
          ))}
        >
          {loading 
            ? (isLogin ? 'Logging in...' : 'Registering...') 
            : (isLogin ? 'Login' : 'Register')
          }
        </button>
      </form>
      
      <div className="form-switch">
        <p>
          {isLogin 
            ? "Don't have an account?" 
            : "Already have an account?"}
          <button 
            type="button" 
            className="btn-link" 
            onClick={toggleForm}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 