import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  Badge,
  Chip,
  useMediaQuery
} from '@mui/material';

import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Assessment as AssessmentIcon,
  ReceiptLong as ReceiptLongIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  KeyboardDoubleArrowLeft as CollapseIcon,
  KeyboardDoubleArrowRight as ExpandIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

import NotificationManager from './NotificationManager';

const drawerWidth = 250;
const collapsedWidth = 80;

const navLinks = [
  { to: '/dashboard', icon: <DashboardIcon />, text: 'Dashboard', badge: null },
  { to: '/inventory', icon: <InventoryIcon />, text: 'Inventory', badge: null },
  { to: '/suppliers', icon: <BusinessIcon />, text: 'Suppliers', badge: null },
  { to: '/invoices', icon: <ReceiptLongIcon />, text: 'Invoices', badge: null },
  { to: '/reports', icon: <BarChartIcon />, text: 'Analytics', badge: null },
  { to: '/settings', icon: <SettingsIcon />, text: 'Settings', badge: null },
];

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role') || '';
  const userName = userData.name || 'User';
  const userRole = role || 'Administrator';
  
  // Determine profile picture based on role
  const getProfilePicture = () => {
    if (role === 'Admin') {
      return '/assets/icons/arthur.jpg';
    } else if (role === 'Staff') {
      return '/assets/icons/staff.png';
    }
    return '/assets/icons/arthur.jpg'; // Fallback to existing image
  };

  const toggleCollapse = () => {
    // Don't allow expanding on mobile devices
    if (isMobile && !collapsed) {
      return;
    }
    setCollapsed(!collapsed);
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const sidebarWidth = isMobile ? collapsedWidth : (collapsed ? collapsedWidth : drawerWidth);
  
  return (
    <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden', position: 'relative' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2E3A8C 0%, #1a246e 100%)',
            borderRight: 'none',
            color: '#fff',
            transition: 'width 0.3s ease, box-shadow 0.3s ease',
            overflowX: 'hidden',
            boxShadow: '0 0 20px rgba(0,0,0,0.15)',
            position: 'fixed'
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo Section */}
          <Box sx={{ 
            p: { xs: 1.5, sm: 2.5 }, 
            textAlign: 'center', 
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            transition: 'padding 0.3s ease',
            position: 'relative'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1.5 
            }}>
              <Avatar 
                src="/assets/logo.jpg" 
                alt="AIVENTORY Logo" 
                sx={{ 
                  width: isMobile || collapsed ? 44 : 56, 
                  height: isMobile || collapsed ? 44 : 56,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }} 
              />
              {!collapsed && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, letterSpacing: 0.5 }}>
                    AIVENTORY
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>
                    SMART INVENTORY
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Collapse Button */}
            <IconButton
              onClick={toggleCollapse}
              sx={{
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: '#fff',
                color: '#2E3A8C',
                width: 24,
                height: 24,
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#f0f0f0',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {collapsed ? <ExpandIcon sx={{ fontSize: 16 }} /> : <CollapseIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>

          {/* Time Display */}
          <Box sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            textAlign: 'center',
            background: 'rgba(255,255,255,0.05)',
            mb: 2,
            borderRadius: '0 0 12px 12px',
            mx: 1.5
          }}>
            <Typography 
              variant={{ xs: 'h6', sm: 'h5' }} 
              sx={{ 
                color: '#fff' , 
                fontWeight: 700,
                display: 'block',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              {formatTime(time)}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                display: 'block',
                mt: 0.5,
                fontWeight: 500
              }}
            >
              {formatDate(time)}
            </Typography>
          </Box>

          {/* Navigation Links */}
          <List sx={{ flex: 1, py: 1, px: 1 }}>
            {navLinks.map(link => (
              <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? link.text : ''} placement="right">
                  <ListItemButton
                    component={Link}
                    to={link.to}
                    selected={location.pathname === link.to}
                    sx={{
                      minHeight: 48,
                      borderRadius: 2,
                      mb: 0.5,
                      mx: 0.5,
                      color: location.pathname === link.to ? '#fff' : 'rgba(255,255,255,0.8)',
                      backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.2)' : 'transparent',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        transform: 'translateX(4px)',
                      },
                      '&::before': {
                        content: location.pathname === link.to ? '""' : 'none',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: '#fff',
                        borderRadius: '0 4px 4px 0',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: collapsed ? 2 : 2.5,
                      py: 1.5
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 0, 
                        mr: collapsed ? 0 : 2, 
                        justifyContent: 'center',
                        color: 'inherit',
                        transition: 'margin 0.3s ease'
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={link.text} 
                      sx={{ 
                        opacity: collapsed ? 0 : 1, 
                        transition: 'opacity 0.3s ease',
                        fontWeight: location.pathname === link.to ? 700 : 500
                      }} 
                    />
                    {link.badge && (
                      <Badge 
                        badgeContent={link.badge} 
                        color="error"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            right: collapsed ? 'auto' : 0,
                            top: collapsed ? 'auto' : 12
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          {/* User Profile Section */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                src={getProfilePicture()} 
                alt={userName} 
                sx={{ 
                  width: collapsed ? 36 : 40, 
                  height: collapsed ? 36 : 40,
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(255,255,255,0.2)'
                }} 
              />
              {!collapsed && (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {userName}
                  </Typography>
                  <Chip 
                    label={userRole} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(228, 18, 18, 0.77)', 
                      color: '#fff',
                      fontWeight: 500,
                      height: 20,
                      fontSize: 10
                    }} 
                  />
                </Box>
              )}
              <IconButton 
                component={Link}
                to="/login"
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  p: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff'
                  }
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
      
      {/* Main Content Area - Fixed overlap issues */}
      <Box
        component="main"
        sx={{
          flex: '1 1 auto',
          minHeight: '100vh',
          background: 'var(--page-bg)',
          p: 0,
          width: 0, // Force flex to calculate width properly
          minWidth: 0, // Allow flex item to shrink below content size
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1400,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            boxSizing: 'border-box'
          }}
        >
          {children}
        </Box>
      </Box>
      
      <NotificationManager />
    </Box>
  );
}