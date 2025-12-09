//Login.jsx
import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import '../css/style.css';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Email, 
  Lock, 
  AdminPanelSettings,
  SupervisorAccount,
  AccountCircle
} from '@mui/icons-material';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  IconButton, 
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';

const Login = () => {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [role, setRole] = useState('Admin');
  const [newRole, setNewRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Registration form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleShowCreateAccount = (e) => {
    e.preventDefault();
    setShowCreateAccount(true);
    setError('');
  };
  
  const handleBackToLogin = (e) => {
    e.preventDefault();
    setShowCreateAccount(false);
    setError('');
  };
  
  const handleRoleClick = (selectedRole) => setRole(selectedRole);
  const handleNewRoleClick = (selectedRole) => setNewRole(selectedRole);
  
  const handleClickShowLoginPassword = () => setShowLoginPassword(!showLoginPassword);
  const handleClickShowRegPassword = () => setShowRegPassword(!showRegPassword);
  
  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginIdentifier || !loginPassword) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/api/login`, {
        email: loginIdentifier,
        username: loginIdentifier,
        password: loginPassword,
        role
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName || !regEmail || !regUsername || !regPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/api/register`, {
        fullName,
        email: regEmail,
        username: regUsername,
        password: regPassword,
        role: newRole
      });

      // Clear the registration form
      setFullName("");
      setRegEmail("");
      setRegUsername("");
      setRegPassword("");
      
      // Switch back to login form
      setShowCreateAccount(false);
      
      // Pre-fill the login form with the new account details
      setLoginIdentifier(regEmail);
      setLoginPassword(regPassword);
      setRole(newRole);
      
      setError(res.data.message + " Please login with your new account.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: { xs: 1, sm: 2 }
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            background: 'linear-gradient(180deg, #2E3A8C 0%, #1a246e 100%)',
            color: 'white',
            textAlign: 'center',
            py: { xs: 3, sm: 4 },
            px: { xs: 1, sm: 2 }
          }}
        >
          <img 
            src="/assets/logo.jpg" 
            alt="AIVENTORY Logo" 
            style={{ 
              width: '80px',
              height: '80px',
              marginBottom: 16,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.2)',
              '@media (min-width: 600px)': {
                width: '100px',
                height: '100px'
              }
            }} 
          />
          <Typography variant="h4" fontWeight={700} mb={1} sx={{ color: 'white' }}>
            AIVENTORY
          </Typography>
          <Typography variant="h6" fontWeight={500} mb={1} sx={{ color: 'white' }}>
            SMART INVENTORY MANAGEMENT
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Predictive Replenishment and Alert Notifications
          </Typography>
        </Box>
        
        <Box sx={{ p: { xs: 2, sm: 3 }, background: 'var(--surface)' }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: 2, background: 'var(--surface)', color: 'var(--text-primary)' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          {!showCreateAccount ? (
            <form onSubmit={handleLoginSubmit}>
              <TextField
                fullWidth
                label="Email or Username"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                helperText="Enter your email or username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'var(--text-secondary)'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowLoginPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: 'var(--text-primary)' }}
                      >
                        {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                mt: 3, 
                mb: 2, 
                gap: { xs: 0.5, sm: 1 },
                background: 'var(--surface)',
                borderRadius: { xs: 1.5, sm: 2 },
                p: { xs: 0.25, sm: 0.5 },
                border: '1px solid var(--border-color)'
              }}>
                <Button
                  fullWidth
                  variant={role === 'Admin' ? 'contained' : 'outlined'}
                  onClick={() => handleRoleClick('Admin')}
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(role === 'Admin' ? {
                      bgcolor: '#2E3A8C',
                      '&:hover': { bgcolor: '#1a246e' },
                      color: 'white'
                    } : {
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--surface)',
                      '&:hover': { 
                        backgroundColor: 'rgba(46, 58, 140, 0.1)',
                        borderColor: 'var(--border-color)'
                      }
                    })
                  }}
                >
                  Admin
                </Button>
                <Button
                  fullWidth
                  variant={role === 'Staff' ? 'contained' : 'outlined'}
                  onClick={() => handleRoleClick('Staff')}
                  startIcon={<SupervisorAccount />}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(role === 'Staff' ? {
                      bgcolor: '#2E3A8C',
                      '&:hover': { bgcolor: '#1a246e' },
                      color: 'white'
                    } : {
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--surface)',
                      '&:hover': { 
                        backgroundColor: 'rgba(46, 58, 140, 0.1)',
                        borderColor: 'var(--border-color)'
                      }
                    })
                  }}
                >
                  Staff
                </Button>
              </Box>
              
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: { xs: 1, sm: 1.5 },
                  mt: 1,
                  mb: 2,
                  bgcolor: '#2E3A8C',
                  '&:hover': { bgcolor: '#1a246e' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'white'
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <Button 
                    onClick={handleShowCreateAccount}
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#2E3A8C' }}
                  >
                    Create Account
                  </Button>
                </Typography>
              </Box>
            </form>
          ) : (
            <form onSubmit={handleCreateAccountSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Username"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showRegPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'var(--text-primary)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowRegPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: 'var(--text-primary)' }}
                      >
                        {showRegPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { color: 'var(--text-primary)' }
                }}
                InputLabelProps={{
                  sx: { color: 'var(--text-secondary)' }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--border-color)',
                    },
                  }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                mt: 3, 
                mb: 2, 
                gap: { xs: 0.5, sm: 1 },
                background: 'var(--surface)',
                borderRadius: { xs: 1.5, sm: 2 },
                p: { xs: 0.25, sm: 0.5 },
                border: '1px solid var(--border-color)'
              }}>
                <Button
                  fullWidth
                  variant={newRole === 'Admin' ? 'contained' : 'outlined'}
                  onClick={() => handleNewRoleClick('Admin')}
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(newRole === 'Admin' ? {
                      bgcolor: '#2E3A8C',
                      '&:hover': { bgcolor: '#1a246e' },
                      color: 'white'
                    } : {
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--surface)',
                      '&:hover': { 
                        backgroundColor: 'rgba(46, 58, 140, 0.1)',
                        borderColor: 'var(--border-color)'
                      }
                    })
                  }}
                >
                  Admin
                </Button>
                <Button
                  fullWidth
                  variant={newRole === 'Staff' ? 'contained' : 'outlined'}
                  onClick={() => handleNewRoleClick('Staff')}
                  startIcon={<SupervisorAccount />}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(newRole === 'Staff' ? {
                      bgcolor: '#2E3A8C',
                      '&:hover': { bgcolor: '#1a246e' },
                      color: 'white'
                    } : {
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--surface)',
                      '&:hover': { 
                        backgroundColor: 'rgba(46, 58, 140, 0.1)',
                        borderColor: 'var(--border-color)'
                      }
                    })
                  }}
                >
                  Staff
                </Button>
              </Box>
              
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: { xs: 1, sm: 1.5 },
                  mt: 1,
                  mb: 2,
                  bgcolor: '#2E3A8C',
                  '&:hover': { bgcolor: '#1a246e' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'white'
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <Button 
                    onClick={handleBackToLogin}
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#2E3A8C' }}
                  >
                    Back to Login
                  </Button>
                </Typography>
              </Box>
            </form>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;