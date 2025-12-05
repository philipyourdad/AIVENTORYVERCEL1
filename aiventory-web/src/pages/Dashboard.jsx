import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import InfoIcon from '@mui/icons-material/Info';

import SidebarLayout from '../components/SidebarLayout';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/api';

// Define fallback parts data
const FALLBACK_PARTS = [
  {
    product_id: 1,
    product_name: "Engine Oil",
    product_sku: "EO-001",
    product_price: 25.99,
    product_stock: 50,
    reorder_level: 10,
    product_status: "Active",
    product_category: "Lubricants"
  },
  {
    product_id: 2,
    product_name: "Brake Pads",
    product_sku: "BP-002",
    product_price: 45.50,
    product_stock: 25,
    reorder_level: 5,
    product_status: "Active",
    product_category: "Brakes"
  },
  {
    product_id: 3,
    product_name: "Air Filter",
    product_sku: "AF-003",
    product_price: 15.75,
    product_stock: 5,
    reorder_level: 10,
    product_status: "Active",
    product_category: "Engine"
  }
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

const estimateDailyUsage = (stock, threshold) => {
  const baseline = Math.max(threshold || 1, stock || 1);
  return Math.max(0.25, baseline / 20);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ lowStock: true }); // Add settings state

  // Load settings from localStorage and listen for changes
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
    };

    // Load initial settings
    loadSettings();

    // Listen for storage changes (when settings are updated in other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'appSettings') {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/invoices`),
      ]);

      const productData = productsRes.ok ? await productsRes.json() : [];
      const invoiceData = invoicesRes.ok ? await invoicesRes.json() : [];

      setProducts(Array.isArray(productData) && productData.length ? productData : FALLBACK_PARTS);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      setError('Showing demo data while we reconnect to the server.');
      setProducts(FALLBACK_PARTS);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const analytics = useMemo(() => {
    // Load settings to determine if we should calculate alerts
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { lowStock: true };
    const shouldShowAlerts = settings.lowStock;

    const now = Date.now();
    const usageMap = new Map();

    invoices
      .filter((invoice) => invoice && invoice.status === 'Paid')
      .forEach((invoice) => {
        const invoiceDate = new Date(invoice.invoice_date || invoice.invoiceDate || invoice.created_at || Date.now());
        const invoiceTime = invoiceDate.getTime();
        if (Number.isNaN(invoiceTime)) return;

        const daysAgo = (now - invoiceTime) / (1000 * 60 * 60 * 24);
        if (daysAgo > 90) return; // limit window to most recent 3 months

        const items = Array.isArray(invoice.items) ? invoice.items : [];
        items.forEach((item) => {
          const rawId = item.product_id ?? item.productId ?? item.Product_id ?? item.ProductID;
          if (rawId === undefined || rawId === null) return;
          const idKey = String(rawId);
          const quantity = Number(item.quantity ?? item.Quantity ?? 0);
          if (!quantity) return;

          if (!usageMap.has(idKey)) {
            usageMap.set(idKey, {
              totalQty: 0,
              minTime: invoiceTime,
              maxTime: invoiceTime,
            });
          }
          const record = usageMap.get(idKey);
          record.totalQty += quantity;
          record.minTime = Math.min(record.minTime, invoiceTime);
          record.maxTime = Math.max(record.maxTime, invoiceTime);
        });
      });

    usageMap.forEach((record) => {
      const windowMs = Math.max(1, record.maxTime - record.minTime);
      record.windowDays = Math.max(1, Math.round(windowMs / (1000 * 60 * 60 * 24)) + 1);
    });

    const totalItems = products.length;
    const lowStock = products.filter((item) => Number(item.product_stock ?? item.Product_stock ?? 0) <= Number(item.reorder_level ?? item.reorder_level ?? 0));
    const critical = lowStock.filter((item) => Number(item.product_stock ?? item.Product_stock ?? 0) <= 0);

    // Only calculate alerts if lowStock alerts are enabled
    const alerts = shouldShowAlerts ? products
      .map((item) => {
        const stock = Number(item.product_stock ?? item.Product_stock ?? 0);
        const threshold = Number(item.reorder_level ?? item.reorder_level ?? 0);
        if (!threshold && stock > 0) return null;

        const idKey = String(item.product_id ?? item.Product_id ?? item.product_sku ?? item.Product_sku ?? item.ProductId ?? `sku-${item.product_sku ?? item.Product_sku}`);
        const usageRecord = usageMap.get(idKey);

        let dailyUsage;
        if (usageRecord && usageRecord.totalQty > 0) {
          const windowDays = Math.max(1, usageRecord.windowDays);
          dailyUsage = usageRecord.totalQty / windowDays;
          } else {
          dailyUsage = estimateDailyUsage(stock, threshold);
        }

        if (dailyUsage <= 0) dailyUsage = estimateDailyUsage(stock, threshold);

        const projectedDays = dailyUsage > 0 ? Math.max(1, Math.round(stock / dailyUsage)) : 999;

        const status = stock <= threshold ? 'critical' : stock <= threshold * 1.25 ? 'warning' : 'normal';
        if (status === 'normal') return null;

        return {
          id: idKey,
          name: item.product_name ?? item.Product_name,
          sku: item.product_sku ?? item.Product_sku,
          status,
          stock,
          threshold,
          daysRemaining: projectedDays,
          dailyUsage: Number(dailyUsage.toFixed(2)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 6) : [];

    return {
      totalItems,
      lowStockCount: lowStock.length,
      criticalCount: shouldShowAlerts ? alerts.filter((alert) => alert.status === 'critical').length || critical.length : 0,
      alerts: shouldShowAlerts ? alerts : [],
    };
  }, [products, invoices, settings]);

  const alertAccent = (status) => {
    if (status === 'critical') return '#FF6B6B';
    if (status === 'warning') return '#F4A261';
    return '#2E3A8C';
  };

const SummaryCard = ({ icon, title, value, helper, color = '#2E3A8C', trend = null }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 4,
      border: '1px solid #e7e9ef',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
        border: '1px solid #d0d7de'
      }
    }}
  >
    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: 3,
        px: 2
      }}
    >
      <Avatar 
        sx={{ 
          bgcolor: `${color}15`, 
          color, 
          width: 64, 
          height: 64,
          mb: 1,
          boxShadow: `0 4px 12px ${color}20`
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography 
          color="text.secondary" 
          variant="body2" 
          sx={{ 
            textTransform: 'uppercase', 
            letterSpacing: 1,
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          sx={{ 
            lineHeight: 1.2,
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mt: 0.5
          }}
        >
          {value}
        </Typography>
        {helper && (
          <Typography 
            color="text.secondary" 
            variant="body2" 
            sx={{ 
              mt: 0.5,
              fontSize: '0.8rem'
            }}
          >
            {helper}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend > 0 ? '#06D6A0' : '#FF6B6B',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

const AlertCard = ({
  alert,
  accent,
}) => (
  <Box
    sx={{
      border: '1px solid #e7e9ef',
      borderRadius: 4,
      p: { xs: 2, md: 3 },
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, sm: 3 },
      alignItems: { xs: 'flex-start', sm: 'center' },
      background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
      height: '100%',
      width: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        border: '1px solid #d0d7de'
      }
    }}
  >
    <Avatar sx={{ bgcolor: `${accent}15`, color: accent, width: 56, height: 56, flexShrink: 0, boxShadow: `0 4px 12px ${accent}20` }}>
      <ErrorOutlineIcon />
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography 
        variant="h6" 
        fontWeight={700}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          color: '#1a1a1a'
        }}
      >
        {alert.name}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          mb: 1
        }}
      >
        {alert.sku}
      </Typography>
      <Typography sx={{ mb: 1.5 }} fontWeight={600} color={accent}>
        Predicted to run out in {alert.daysRemaining} day{alert.daysRemaining > 1 ? 's' : ''}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Stock:</strong> {alert.stock}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Threshold:</strong> {alert.threshold}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, (alert.threshold ? (alert.stock / alert.threshold) * 100 : 0)))}
        sx={{ 
          height: 8, 
          borderRadius: 4, 
          bgcolor: '#f1f3f9',
          '& .MuiLinearProgress-bar': { 
            bgcolor: accent,
            borderRadius: 4
          } 
        }}
      />
    </Box>
    <Stack direction={{ xs: 'row', sm: 'column' }} spacing={{ xs: 1, sm: 1.5 }} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
      <Button 
        variant="contained" 
        color="error" 
        disableElevation 
        fullWidth={{ xs: true, sm: false }}
        sx={{ 
          minWidth: { xs: 0, sm: 140 },
          borderRadius: 2,
          py: 1,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(255, 107, 107, 0.3)'
          }
        }}
        onClick={() => {
          // Navigate to inventory page to manage stock for this item
          navigate('/inventory', { state: { highlightSku: alert.sku, highlightId: alert.id } });
        }}
      >
        Reorder Now
      </Button>
      <Button 
        variant="outlined" 
        fullWidth={{ xs: true, sm: false }}
        sx={{ 
          minWidth: { xs: 0, sm: 140 },
          borderRadius: 2,
          py: 1,
          fontWeight: 600,
          textTransform: 'none',
          borderColor: '#d0d7de',
          color: '#454545',
          '&:hover': {
            borderColor: '#b0b8c1',
            backgroundColor: '#f6f8fa'
          }
        }}
        onClick={() => {
          // Navigate to prediction page with product ID
          navigate(`/prediction/${alert.id}`);
        }}
      >
        View Details
      </Button>
    </Stack>
  </Box>
);

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{ 
                color: '#2E3A8C',
                mb: 0.5,
                background: 'linear-gradient(90deg, #2E3A8C, #6C63FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Dashboard
            </Typography>
            <Typography color="text.secondary" variant="subtitle1">
              Welcome back! Here's what's happening with your inventory today.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={fetchData} 
            disableElevation
            sx={{ 
              bgcolor: '#2E3A8C',
              '&:hover': { bgcolor: '#1a246e' },
              py: 1.5,
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(46, 58, 140, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(46, 58, 140, 0.35)',
                bgcolor: '#1a246e'
              }
            }}
          >
            Refresh Data
          </Button>
        </Stack>

        {error && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack alignItems="center" spacing={3} sx={{ py: 12 }}>
            <CircularProgress 
              size={56} 
              thickness={4} 
              sx={{ color: '#2E3A8C' }}
            />
            <Typography color="text.secondary" variant="h6">Loading dashboard data...</Typography>
            <Typography color="text.secondary" variant="body2">Analyzing your inventory trends</Typography>
          </Stack>
        ) : (
          <Stack spacing={5}>
            {/* Key Metrics Section */}
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                sx={{ 
                  mb: 3, 
                  color: '#2E3A8C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <InventoryIcon sx={{ fontSize: 28 }} />
                Inventory Overview
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <SummaryCard
                    icon={<InventoryIcon />}
                    title="Total Items"
                    value={analytics.totalItems}
                    helper="Active products in inventory"
                    color="#2E3A8C"
                    trend={2.5} // Mock trend data
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <SummaryCard
                    icon={<WarningIcon />}
                    title="Low-Stock Alerts"
                    value={settings.lowStock ? analytics.lowStockCount : 0}
                    helper="Items below reorder threshold"
                    color="#F4A261"
                    trend={-1.2} // Mock trend data
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <SummaryCard
                    icon={<ErrorOutlineIcon />}
                    title="Critical Items"
                    value={settings.lowStock ? analytics.criticalCount : 0}
                    helper="Urgent restock required"
                    color="#FF6B6B"
                    trend={-3.7} // Mock trend data
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <SummaryCard
                    icon={<FiberManualRecordIcon />}
                    title="Active Alerts"
                    value={settings.lowStock ? analytics.alerts.length : 0}
                    helper="AI-powered notifications"
                    color="#6C63FF"
                    trend={0} // Mock trend data
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Alerts Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  sx={{ 
                    color: '#2E3A8C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: 28 }} />
                  AI-Powered Alerts
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    bgcolor: '#2E3A8C10', 
                    px: 2.5, 
                    py: 0.75, 
                    borderRadius: 2,
                    color: '#2E3A8C',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <FiberManualRecordIcon sx={{ fontSize: 12 }} />
                  {analytics.alerts.length} Active Notifications
                </Typography>
              </Box>
              
              <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <CardContent>
                  {!settings.lowStock ? (
                    <Alert 
                      severity="info" 
                      icon={<InfoIcon />}
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        AI-Powered Alerts Disabled
                      </Typography>
                      <Typography variant="body2">
                        AI-Powered Alerts are currently disabled in your settings. 
                        Enable "Low Stock Alerts" in the Settings page to receive notifications about low inventory items.
                      </Typography>
                    </Alert>
                  ) : (
                    <>
                      {analytics.alerts.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <Avatar sx={{ 
                            bgcolor: '#06D6A015', 
                            color: '#06D6A0', 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 3,
                            boxShadow: '0 8px 20px rgba(6, 214, 160, 0.2)'
                          }}>
                            <InventoryIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: '#06D6A0' }}>
                            All Clear!
                          </Typography>
                          <Typography color="text.secondary" variant="h6" sx={{ mb: 2 }}>
                            Your inventory is in excellent condition
                          </Typography>
                          <Typography color="text.secondary">
                            No immediate action required. Continue monitoring your stock levels regularly.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={3}>
                          {analytics.alerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} accent={alertAccent(alert.status)} />
                          ))}
                        </Stack>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>

            
          </Stack>
        )}
      </Box>
    </SidebarLayout>
  );
};

export default Dashboard;
