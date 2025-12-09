import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, IconButton, Slide, Typography } from '@mui/material';
import { Close as CloseIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';

const NotificationToast = ({ notification, onClose }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notification) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [notification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    // Call onClose after animation completes
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!notification) return null;

  const getSeverity = () => {
    switch (notification.type) {
      case 'out_of_stock':
        return 'error';
      case 'critical':
        return 'error';
      case 'warning':
      case 'low_stock':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'out_of_stock':
      case 'critical':
        return <ErrorIcon />;
      case 'warning':
      case 'low_stock':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'critical':
        return 'Critical Stock';
      case 'low_stock':
        return 'Low Stock';
      default:
        return 'Notification';
    }
  };

  const getColorScheme = () => {
    switch (notification.type) {
      case 'out_of_stock':
      case 'critical':
        return {
          bg: 'var(--danger)',
          border: 'var(--danger)',
          text: 'var(--text-primary)'
        };
      case 'warning':
      case 'low_stock':
        return {
          bg: 'var(--warning)',
          border: 'var(--warning)',
          text: 'var(--text-primary)'
        };
      default:
        return {
          bg: 'var(--primary-gradient)',
          border: 'var(--primary-gradient)',
          text: 'var(--text-primary)'
        };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={(props) => <Slide {...props} direction="left" />}
      sx={{ 
        mb: 3,
        mr: 3
      }}
    >
      <Alert
        icon={getIcon()}
        onClose={handleClose}
        severity={getSeverity()}
        variant="standard"
        sx={{ 
          width: '100%', 
          minWidth: 380,
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${colorScheme.border}`,
          background: `linear-gradient(135deg, ${colorScheme.bg} 0%, ${colorScheme.bg}DD 100%)`,
          color: colorScheme.text,
          backdropFilter: 'blur(12px)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
            },
            '50%': {
              transform: 'scale(1.02)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)'
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
            }
          },
          '& .MuiAlert-icon': {
            color: colorScheme.text,
            fontSize: 28
          },
          '& .MuiAlert-message': {
            width: '100%',
            paddingRight: 4,
            paddingTop: 1,
            paddingBottom: 1
          }
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
            sx={{ 
              position: 'absolute',
              top: 12,
              right: 12,
              padding: 0.5,
              color: colorScheme.text,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={700}
          sx={{ 
            mb: 0.5,
            color: colorScheme.text
          }}
        >
          {getTitle()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: colorScheme.text,
            opacity: 0.9
          }}
        >
          {notification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;