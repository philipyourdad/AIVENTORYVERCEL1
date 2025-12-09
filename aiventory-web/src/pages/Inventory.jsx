// Inventory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SidebarLayout from '../components/SidebarLayout';
import { API_BASE } from '../config/api';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Insights as InsightsIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  TableRows as TableRowsIcon,
  GridView as GridViewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  Category as CategoryIcon,
  AutoAwesome as AIAwesomeIcon,
  Remove as RemoveIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  'Good': 'var(--success)',
  'Warning': 'var(--warning)',
  'Critical': 'var(--error)',
  'Active': 'var(--success)',
  'Inactive': 'var(--text-secondary)',
};

const categories = [
  'Lubricants',
  'Battery',
  'Electrical',
  'Brakes',
  'Engine',
  'Transmission',
];

export default function Inventory() {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userData.name || 'User';
  
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    threshold: '',
    price: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Function to determine product status based on stock levels
  const getProductStatus = (stock, threshold) => {
    if (stock <= threshold) return 'Critical';
    if (stock <= threshold * 1.5) return 'Warning';
    return 'Good';
  };

  // Function to log audit trail
  const logAuditTrail = (action, productData, beforeData = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      product: productData,
      before: beforeData,
      user: userName // Use actual user name from localStorage
    };
    setAuditLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
    console.log('Audit Log:', logEntry);
  };

  // Comprehensive function to fetch and sync products with database
  const fetchAndSyncProducts = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching products from database...');
      console.log('API Base URL:', API_BASE);
      const res = await axios.get(`${API_BASE}/api/products`);
      
      console.log('📥 Raw response from API:', res.data);
      console.log(`📈 Received ${res.data.length} products from API`);
      
      // Enhanced data mapping to handle various field name conventions
      const formatted = res.data.map(p => {
        // Handle potential undefined or null product objects
        if (!p) return {};
        
        // Extract all possible field names for each property
        const id = p.product_id || p.Product_id || p.id || null;
        const name = p.product_name || p.Product_name || p.name || '';
        const sku = p.product_sku || p.Product_sku || p.sku || '';
        const category = p.product_category || p.Product_category || p.category || '';
        const stock = p.product_stock !== undefined ? p.product_stock : 
                     (p.Product_stock !== undefined ? p.Product_stock : 
                     (p.stock !== undefined ? p.stock : 0));
        const threshold = p.reorder_level !== undefined ? p.reorder_level : 
                         (p.threshold !== undefined ? p.threshold : 0);
        const price = p.product_price !== undefined ? p.product_price : 
                     (p.Product_price !== undefined ? p.Product_price : 
                     (p.price !== undefined ? p.price : 0));
        const productStatus = p.product_status || p.Product_status || p.status || 'Active';
        const created_at = p.created_at || null;
        const updated_at = p.updated_at || null;
        
        // Calculate status based on stock levels
        const status = getProductStatus(stock, threshold);
        
        return {
          id,
          name,
          sku,
          category,
          stock,
          threshold,
          price,
          status,
          productStatus,
          created_at,
          updated_at
        };
      });
      
      console.log('📦 Formatted products:', formatted);
      
      setInventory(formatted);
      setTotalItems(formatted.length);
      console.log(`📊 Setting inventory state with ${formatted.length} items`);
      setFetchError(null);
      
      console.log(`✅ Successfully synced ${formatted.length} products from database`);
      logAuditTrail('SYNC', { totalProducts: formatted.length });
      
    } catch (err) {
      setFetchError("Error fetching products. Please check your backend connection.");
      console.error("❌ Error fetching products:", err);
      if (err.response) {
        console.error("📡 Error response:", err.response.data);
        console.error("🔢 Error status:", err.response.status);
        console.error("📋 Error headers:", err.response.headers);
      } else if (err.request) {
        console.error("📡 Error request:", err.request);
      } else {
        console.error("💬 Error message:", err.message);
      }
      logAuditTrail('SYNC_ERROR', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic sync
  useEffect(() => {
    fetchAndSyncProducts();
    
    // Set up periodic sync every 30 seconds to ensure data consistency
    const syncInterval = setInterval(fetchAndSyncProducts, 30000);
    
    // Live updates via Server-Sent Events (SSE)
    let es;
    try {
      es = new EventSource(`${API_BASE}/api/events`);
      es.addEventListener('inventory_updated', () => {
        fetchAndSyncProducts();
      });
    } catch (e) {
      // SSE not critical; ignore if unavailable
    }
    
    return () => {
      clearInterval(syncInterval);
      try { es && es.close(); } catch (_) {}
    };
  }, []);

  // Filter inventory based on search, category, and status
  const filteredInventory = inventory.filter(item => {
    try {
      // Defensive checks for item existence
      if (!item) return false;
      
      // Add null checks for all fields with default values
      const itemName = (item.name && typeof item.name === 'string') ? item.name : '';
      const itemSku = (item.sku && typeof item.sku === 'string') ? item.sku : '';
      const itemCategory = (item.category && typeof item.category === 'string') ? item.category : '';
      const itemStatus = (item.status && typeof item.status === 'string') ? item.status : '';
      
      // Ensure search term is defined before calling toLowerCase
      const searchTerm = (search && typeof search === 'string') ? search : '';
      
      // Debug logging (will be removed in production builds)
      // console.log('🔍 Filtering item:', { itemName, itemSku, itemCategory, itemStatus, searchTerm });
      
      // Safely check if search term matches item name or SKU
      let matchesSearch = false;
      try {
        // Extra safety check for toLowerCase calls
        const safeItemName = itemName || '';
        const safeItemSku = itemSku || '';
        const safeSearchTerm = searchTerm || '';
        
        matchesSearch = (safeItemName.toLowerCase && safeItemName.toLowerCase().includes(safeSearchTerm.toLowerCase())) ||
          (safeItemSku.toLowerCase && safeItemSku.toLowerCase().includes(safeSearchTerm.toLowerCase())) ||
          safeSearchTerm === '';
      } catch (e) {
        console.error('❌ Error in search filter:', e);
        console.error('🔍 Search filter values:', { itemName, itemSku, searchTerm });
        matchesSearch = true; // Default to showing item if there's an error
      }
      
      // Category filter with extra safety
      let matchesCategory = true;
      try {
        const safeItemCategory = itemCategory || '';
        const safeCategoryFilter = (categoryFilter && typeof categoryFilter === 'string') ? categoryFilter : 'All';
        matchesCategory = safeCategoryFilter === 'All' || 
          (safeItemCategory.toLowerCase && safeItemCategory === safeCategoryFilter);
      } catch (e) {
        console.error('❌ Error in category filter:', e);
        matchesCategory = true;
      }
      
      // Status filter with extra safety
      let matchesStatus = true;
      try {
        const safeItemStatus = itemStatus || '';
        const safeStatusFilter = (statusFilter && typeof statusFilter === 'string') ? statusFilter : 'All';
        matchesStatus = safeStatusFilter === 'All' || 
          (safeItemStatus.toLowerCase && safeItemStatus === safeStatusFilter);
      } catch (e) {
        console.error('❌ Error in status filter:', e);
        matchesStatus = true;
      }
      
      const result = matchesSearch && matchesCategory && matchesStatus;
      // console.log('📊 Filter result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error in filter function:', error);
      console.error('🔍 Item causing error:', item);
      return true; // Show all items if there's an error in filtering
    }
  });

  // Pagination
  // console.log('📄 Pagination input:', { filteredInventoryLength: filteredInventory.length, itemsPerPage, page });
  const totalPages = Math.ceil((filteredInventory.length || 0) / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  // console.log('📄 Pagination output:', { totalPages, paginatedInventoryLength: paginatedInventory.length });

  // Get unique categories for filter with extra safety
  const uniqueCategories = ['All', ...new Set(inventory.map(item => {
    try {
      // console.log('🔍 Processing category for item:', item);
      if (!item) return '';
      const category = (item.category && typeof item.category === 'string') ? item.category : '';
      // console.log('🏷️ Category result:', category);
      return category;
    } catch (error) {
      console.error('❌ Error processing category for item:', item, error);
      return '';
    }
  }).filter(cat => cat !== ''))]; // Filter out empty strings

  // Get unique statuses for filter with extra safety
  const uniqueStatuses = ['All', ...new Set(inventory.map(item => {
    try {
      // console.log('🔍 Processing status for item:', item);
      if (!item) return '';
      const status = (item.status && typeof item.status === 'string') ? item.status : '';
      // console.log('📊 Status result:', status);
      return status;
    } catch (error) {
      console.error('❌ Error processing status for item:', item, error);
      return '';
    }
  }).filter(status => status !== ''))]; // Filter out empty strings

  const handleOpenModal = (item, idx) => {
    if (item) {
      setForm({
        name: item.name,
        sku: item.sku,
        category: item.category,
        stock: item.stock,
        threshold: item.threshold,
        price: item.price || ''
      });
      setEditIndex(idx);
    } else {
      setForm({ name: '', sku: '', category: '', stock: '', threshold: '', price: '' });
      setEditIndex(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ name: '', sku: '', category: '', stock: '', threshold: '', price: '' });
    setEditIndex(null);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || form.stock === '' || form.threshold === '') return;

    const newItem = {
      product_name: form.name,
      product_sku: form.sku,
      product_price: Number(form.price) || 0,
      product_category: form.category,
      reorder_level: Number(form.threshold),
      supplier_id: 1, // Set default supplier_id to avoid null constraint
      product_status: 'Active' // Set default status
    };

    try {
      if (editIndex !== null) {
        const id = inventory[editIndex].id;
        await axios.put(`${API_BASE}/api/products/${id}`, newItem);
        const res = await axios.get(`${API_BASE}/api/products`);
        
        // Use the same enhanced data mapping for consistency
        const formatted = res.data.map(p => {
          if (!p) return {};
          
          const id = p.product_id || p.Product_id || p.id || null;
          const name = p.product_name || p.Product_name || p.name || '';
          const sku = p.product_sku || p.Product_sku || p.sku || '';
          const category = p.product_category || p.Product_category || p.category || '';
          const stock = p.product_stock !== undefined ? p.product_stock : 
                       (p.Product_stock !== undefined ? p.Product_stock : 
                       (p.stock !== undefined ? p.stock : 0));
          const threshold = p.reorder_level !== undefined ? p.reorder_level : 
                           (p.threshold !== undefined ? p.threshold : 0);
          const price = p.product_price !== undefined ? p.product_price : 
                       (p.Product_price !== undefined ? p.Product_price : 
                       (p.price !== undefined ? p.price : 0));
          const productStatus = p.product_status || p.Product_status || p.status || 'Active';
          const created_at = p.created_at || null;
          const updated_at = p.updated_at || null;
          
          const status = getProductStatus(stock, threshold);
          
          return {
            id,
            name,
            sku,
            category,
            stock,
            threshold,
            price,
            status,
            productStatus,
            created_at,
            updated_at
          };
        });
        
        setInventory(formatted);
        setSnackbarMsg("Item updated successfully!");
      } else {
        const res = await axios.post(`${API_BASE}/api/products`, newItem);
        const added = {
          id: res.data.Product_id || res.data.id,
          ...newItem
        };
        setInventory([...inventory, added]);
        setSnackbarMsg("Item added successfully!");
      }
    } catch (err) {
      if (err.response) {
        console.error('Axios error:', err.response.data);
        setSnackbarMsg(`Error saving item: ${err.response.data.error || 'Unknown error'}`);
      } else {
        console.error('Axios error:', err.message);
        setSnackbarMsg("Error saving item.");
      }
    }

    setSnackbarOpen(true);
    handleCloseModal();
  };

  const handleDelete = async (idx) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const id = inventory[idx].id;
      try {
        await axios.delete(`${API_BASE}/api/products/${id}`);
        const res = await axios.get(`${API_BASE}/api/products`);
        
        // Use the same enhanced data mapping for consistency
        const formatted = res.data.map(p => {
          if (!p) return {};
          
          const id = p.product_id || p.Product_id || p.id || null;
          const name = p.product_name || p.Product_name || p.name || '';
          const sku = p.product_sku || p.Product_sku || p.sku || '';
          const category = p.product_category || p.Product_category || p.category || '';
          const stock = p.product_stock !== undefined ? p.product_stock : 
                       (p.Product_stock !== undefined ? p.Product_stock : 
                       (p.stock !== undefined ? p.stock : 0));
          const threshold = p.reorder_level !== undefined ? p.reorder_level : 
                           (p.threshold !== undefined ? p.threshold : 0);
          const price = p.product_price !== undefined ? p.product_price : 
                       (p.Product_price !== undefined ? p.Product_price : 
                       (p.price !== undefined ? p.price : 0));
          const productStatus = p.product_status || p.Product_status || p.status || 'Active';
          const created_at = p.created_at || null;
          const updated_at = p.updated_at || null;
          
          const status = getProductStatus(stock, threshold);
          
          return {
            id,
            name,
            sku,
            category,
            stock,
            threshold,
            price,
            status,
            productStatus,
            created_at,
            updated_at
          };
        });
        
        setInventory(formatted);
        setSnackbarMsg("Item deleted successfully!");
      } catch (err) {
        console.error(err);
        setSnackbarMsg("Error deleting item.");
      }
      setSnackbarOpen(true);
    }
  };

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState(''); // 'add' or 'remove'
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAdjustmentOpen = (item, type) => {
    setSelectedItem(item);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setAdjustModalOpen(true);
  };

  const handleAdjustmentClose = () => {
    setAdjustModalOpen(false);
    setSelectedItem(null);
    setAdjustmentType('');
    setAdjustmentQuantity(1);
  };

  const handleAdjustmentSubmit = async () => {
    if (!selectedItem || (!adjustmentQuantity && adjustmentQuantity !== 0)) return;

    try {
      const currentStock = Number(selectedItem.stock);
      const adjustment = Number(adjustmentQuantity);
      
      let newStock;
      if (adjustmentType === 'add') {
        newStock = currentStock + adjustment;
      } else {
        newStock = Math.max(0, currentStock - adjustment);
      }

      console.log("Updating stock for item:", selectedItem.id, "New stock:", newStock);
      
      // Prepare the data with all required fields using correct Supabase field names
      const updateData = {
        product_name: selectedItem.name,
        product_sku: selectedItem.sku,
        product_category: selectedItem.category,
        product_stock: newStock,
        product_price: selectedItem.price,
        reorder_level: selectedItem.threshold,
        product_status: selectedItem.productStatus || 'Active'
      };

      // Update in database
      const response = await axios.put(`${API_BASE}/api/products/${selectedItem.id}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("API Response:", response);

      if (response.status === 200) {
        // Refresh the data to get the updated information
        const res = await axios.get(`${API_BASE}/api/products`);
        
        // Use the same enhanced data mapping for consistency
        const formatted = res.data.map(p => {
          if (!p) return {};
          
          const id = p.product_id || p.Product_id || p.id || null;
          const name = p.product_name || p.Product_name || p.name || '';
          const sku = p.product_sku || p.Product_sku || p.sku || '';
          const category = p.product_category || p.Product_category || p.category || '';
          const stock = p.product_stock !== undefined ? p.product_stock : 
                       (p.Product_stock !== undefined ? p.Product_stock : 
                       (p.stock !== undefined ? p.stock : 0));
          const threshold = p.reorder_level !== undefined ? p.reorder_level : 
                           (p.threshold !== undefined ? p.threshold : 0);
          const price = p.product_price !== undefined ? p.product_price : 
                       (p.Product_price !== undefined ? p.Product_price : 
                       (p.price !== undefined ? p.price : 0));
          const productStatus = p.product_status || p.Product_status || p.status || 'Active';
          const created_at = p.created_at || null;
          const updated_at = p.updated_at || null;
          
          const status = getProductStatus(stock, threshold);
          
          return {
            id,
            name,
            sku,
            category,
            stock,
            threshold,
            price,
            status,
            productStatus,
            created_at,
            updated_at
          };
        });
        
        setInventory(formatted);
        setSnackbarMsg(`Successfully ${adjustmentType === 'add' ? 'added' : 'removed'} ${adjustment} item(s)!`);
        setSnackbarOpen(true);
        handleAdjustmentClose();
      } else {
        throw new Error(`Failed to update stock. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error adjusting stock:", err);
      console.error("Error details:", err.response?.data || err.message);
      
      // More specific error messages
      if (err.response) {
        // Server responded with error status
        setSnackbarMsg(`Server error: ${err.response.status} - ${err.response.data?.message || err.response.data || 'Failed to update stock'}`);
      } else if (err.request) {
        // Request was made but no response received
        setSnackbarMsg("Network error: Could not reach the server");
      } else {
        // Something else happened
        setSnackbarMsg(`Error: ${err.message}`);
      }
      
      setSnackbarOpen(true);
    }
  };

  return (
    <SidebarLayout>
      <Box sx={{ width: '100%', py: { xs: 2, sm: 3 } }}>
        {/* Header with enhanced actions */}
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} flexWrap="wrap" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'var(--text-primary)', mb: 0.5 }}>
              Inventory
            </Typography>
            <Typography color="text.secondary">

            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap" width={{ xs: '100%', sm: 'auto' }} justifyContent={{ xs: 'stretch', sm: 'flex-end' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              placeholder="Search by name or SKU..."
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'var(--text-secondary)' }} />
                  </InputAdornment>
                ),
                style: { color: 'var(--text-primary)' }
              }}
              InputLabelProps={{
                style: { color: 'var(--text-primary)' }
              }}
              sx={{ 
                background: 'var(--surface)', 
                borderRadius: 2,
                minWidth: { xs: 0, sm: 250 },
                width: { xs: '100%', sm: 'auto' },
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
                '& .MuiInputBase-input::placeholder': {
                  color: 'var(--text-secondary)',
                  opacity: 1
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal(null, null)}
              fullWidth={{ xs: true, sm: false }}
              sx={{ 
                borderRadius: 2, 
                background: 'var(--text-primary)', 
                fontWeight: 600, 
                textTransform: 'none',
                px: { xs: 2, sm: 3 },
                width: { xs: '100%', sm: 'auto' },
                color: 'var(--surface)',
                '&:hover': {
                  background: 'rgba(46, 58, 140, 0.8)'
                }
              }}
            >
              Add New Item
            </Button>
          </Box>
        </Box>

        {/* Filters and View Options */}
        <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} width={{ xs: '100%', sm: 'auto' }}>
              <Box>
                <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
                  Filter Inventory
                </Typography>
              </Box>
              <Box display="flex" gap={2} flexWrap="wrap">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="table" sx={{ borderRadius: 2, border: '1px solid var(--primary)', color: 'var(--text-primary)' }}>
                    <TableRowsIcon />
                  </ToggleButton>
                  <ToggleButton value="grid" sx={{ borderRadius: 2, border: '1px solid var(--pri)', color: 'var(--text-primary)' }}>
                    <GridViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            
            <Box display="flex" gap={2} flexWrap="wrap" width={{ xs: '100%', sm: 'auto' }} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 }, width: { xs: '100%', sm: 'auto' }  }}>
                <InputLabel sx={{ color: 'var(--text-primary)' }}>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)',
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--border-color) !important',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--border-color) !important',
                      borderWidth: '1px'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--border-color) !important',
                      borderWidth: '1px'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-primary)'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgba(255, 0, 0, 0.08)'
                        },
                        '& .Mui-selected:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)'
                        }
                      }
                    }
                  }}
                >
                  {uniqueCategories.map(category => (
                    <MenuItem key={category} value={category} sx={{ color: 'var(--text-primary)' }}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 }, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel sx={{ color: 'var(--text-primary)' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  fullWidth={{ xs: true, sm: false }}
                  sx={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)',
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--primary) !important',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--primary) !important',
                      borderWidth: '1px'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'var(--primary) !important',
                      borderWidth: '1px'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-primary)'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)'
                        },
                        '& .Mui-selected:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)'
                        }
                      }
                    }
                  }}
                >
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status} sx={{ color: 'var(--text-primary)' }}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setSearch('');
                  setPage(1);
                }}
                variant="outlined"
                size="small"
                fullWidth={{ xs: true, sm: false }}
                sx={{ 
                  height: 40, 
                  width: { xs: '100%', sm: 'auto' },
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color) !important',
                  borderWidth: '1px',
                  backgroundColor: 'var(--surface)',
                  '&:hover': { 
                    borderColor: 'var(--border-color) !important',
                    borderWidth: '1px',
                    backgroundColor: 'var(--surface)'
                  }
                }}
              >
                Reset Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Grid container spacing={{ xs: 2, sm: 3 }} mb={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)', height: '100%', background: 'var(--surface)' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(46, 58, 140, 0.1)', borderRadius: '100%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <InventoryIcon sx={{ color: 'var(--text-primary)' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Total Items</Typography>
                    <Typography variant="h4" fontWeight={700}>{inventory.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)', height: '100%', background: 'var(--surface)' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(255, 209, 102, 0.1)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <WarningIcon sx={{ color: 'var(--warning)' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Warning Items</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {inventory.filter(item => item.status === 'Warning').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)', height: '100%', background: 'var(--surface)' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(255, 77, 79, 0.1)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <ErrorOutlineIcon sx={{ color: 'var(--error)' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Critical Items</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {inventory.filter(item => item.status === 'Critical').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)', height: '100%', background: 'var(--surface)' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <CategoryIcon sx={{ color: 'var(--text-primary)' }} />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Categories</Typography>
                    <Typography variant="h4" fontWeight={700}>{uniqueCategories.length - 1}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inventory Display */}
        {fetchError ? (
          <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}>
            <Typography variant="h5">{fetchError}</Typography>
          </Box>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <Typography variant="h6">Loading inventory data...</Typography>
          </Box>
        ) : (
          <>
            {viewMode === 'table' ? (
              // Table View
              <Card sx={{ borderRadius: { xs: 2, sm: 3 }, border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'var(--surface)' }}>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Current Stock</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Threshold</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <InventoryIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary">
                                No products found
                              </Typography>
                              <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Try adjusting your search or filter criteria
                              </Typography>
                              <Button 
                                variant="outlined" 
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal(null, null)}
                              >
                                Add New Item
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedInventory.map((item, idx) => (
                          <TableRow 
                            key={item.id} 
                            sx={{ 
                              '&:hover': { bgcolor: 'var(--surface)', cursor: 'pointer' },
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                            onClick={() => handleAdjustmentOpen(item, 'view')}
                          >
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              <Box display="flex" alignItems="center">
                                <Box 
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%', 
                                    bgcolor: 'var(--surface)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mr: 2
                                  }}
                                >
                                  <InventoryIcon sx={{ color: 'var(--text-secondary)' }} />
                                </Box>
                                <Box>
                                  <Typography fontWeight={500} sx={{ color: 'var(--text-primary)' }}>{item.name}</Typography>
                                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    {item.category}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              <Chip 
                                label={item.sku} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(108, 99, 255, 0.1)', 
                                  color: 'var(--text-primary)',
                                  fontWeight: 500
                                }} 
                              />
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)' }}>{item.category}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)' }}>
                              <Typography fontWeight={500}>{item.stock}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)' }}>{item.threshold}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusColors[item.status] 
                                    ? `${statusColors[item.status]}20` 
                                    : 'rgba(204, 204, 32, 0.2)',
                                  color: statusColors[item.status] || 'var(--text-secondary)',
                                  fontWeight: 600,
                                  minWidth: 100
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton 
                                  color="info" 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/prediction/${item.sku}`);
                                  }}
                                  title="View AI Prediction Details"
                                  sx={{ 
                                    bgcolor: 'rgba(108, 99, 255, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.2)' }
                                  }}
                                >
                                  <AIAwesomeIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                {/* <IconButton 
                                  color="success" 
                                  size="small"
                                  title="Add Stock"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdjustmentOpen(item, 'add');
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(6, 214, 160, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(6, 214, 160, 0.2)' }
                                  }}
                                >
                                  <AddIcon sx={{ fontSize: 18 }} />
                                </IconButton> */}
                                {/* <IconButton 
                                  color="warning" 
                                  size="small"
                                  title="Remove Stock"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdjustmentOpen(item, 'remove');
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)' }
                                  }}
                                >
                                  <RemoveIcon sx={{ fontSize: 18 }} />
                                </IconButton> */}
                                <IconButton 
                                  color="primary" 
                                  size="small"
                                  title="Edit Item Details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(item, (page - 1) * itemsPerPage + idx);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(46, 58, 140, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(46, 58, 140, 0.2)' }
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton 
                                  color="secondary" 
                                  size="small"
                                  title="View Analytics"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/analysis?sku=${item.sku || item.Product_sku}`);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(255, 209, 102, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(255, 209, 102, 0.2)' }
                                  }}
                                >
                                  <InsightsIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton 
                                  color="error" 
                                  size="small"
                                  title="Delete Item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete((page - 1) * itemsPerPage + idx);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)' }
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ) : (
              // Grid View
              <Box>
                {paginatedInventory.length === 0 ? (
                  <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)', py: 8, background: 'var(--surface)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No products found
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Try adjusting your search or filter criteria
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal(null, null)}
                      >
                        Add New Item
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  <Grid container spacing={3}>
                    {paginatedInventory.map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} sx={{ display: 'flex' }}>
                        <Card 
                          sx={{ 
                            borderRadius: { xs: 2, sm: 3 }, 
                            border: '1px solid var(--border-color)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: '0.3s',
                            background: 'var(--surface)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => handleAdjustmentOpen(item, 'view')}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box 
                                sx={{ 
                                  width: 50, 
                                  height: 50, 
                                  borderRadius: '50%', 
                                  bgcolor: 'var(--surface)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center'
                                }}
                              >
                                <InventoryIcon sx={{ color: 'var(--text-secondary)' }} />
                              </Box>
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusColors[item.status] 
                                    ? `${statusColors[item.status]}20` 
                                    : 'rgba(204, 204, 32, 0.2)',
                                  color: statusColors[item.status] || 'var(--text-secondary)',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                            
                            <Typography variant="h6" fontWeight={600} mb={0.5}>
                              {item.name}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" mb={2}>
                              <Chip 
                                label={item.sku} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'rgba(108, 99, 255, 0.1)', 
                                  color: 'var(--text-primary)',
                                  fontWeight: 500,
                                  mr: 1
                                }} 
                              />
                              <Typography variant="body2" color="text.secondary">
                                {item.category}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" mb={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Current Stock
                                </Typography>
                                <Typography fontWeight={600}>
                                  {item.stock} units
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Threshold
                                </Typography>
                                <Typography fontWeight={600}>
                                  {item.threshold}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, Math.max(0, (item.threshold ? (item.stock / item.threshold) * 100 : 0)))}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                bgcolor: 'var(--surface)',
                                '& .MuiLinearProgress-bar': { 
                                  bgcolor: statusColors[item.status] || 'var(--text-primary)' 
                                },
                                mb: 2
                              }} 
                            />
                          </CardContent>
                          
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustmentOpen(item, 'add');
                                }}
                                sx={{ 
                                  flexGrow: 1,
                                  textTransform: 'none',
                                  bgcolor: 'rgba(6, 214, 160, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(6, 214, 160, 0.2)' }
                                }}
                              >
                                Add
                              </Button>
                              <Button
                                size="small"
                                startIcon={<RemoveIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdjustmentOpen(item, 'remove');
                                }}
                                sx={{ 
                                  flexGrow: 1,
                                  textTransform: 'none',
                                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)' }
                                }}
                              >
                                Remove
                              </Button>
                            </Stack>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={{ xs: 2, sm: 3 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                  size="medium"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--surface)',
                      borderColor: 'var(--text-primary)',
                    },
                    '& .MuiPaginationItem-ellipsis': {
                      color: 'var(--text-secondary)',
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Adjustment Modal */}
        <Dialog open={adjustModalOpen} onClose={handleAdjustmentClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {adjustmentType === 'add' 
              ? `Add Stock for ${selectedItem?.name}` 
              : adjustmentType === 'remove' 
                ? `Remove Stock for ${selectedItem?.name}` 
                : `Product Details: ${selectedItem?.name}`}
            <IconButton onClick={handleAdjustmentClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {adjustmentType === 'view' ? (
              // View Details
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      bgcolor: 'var(--surface)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <InventoryIcon sx={{ color: 'var(--text-secondary)', fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>{selectedItem?.name}</Typography>
                    <Chip 
                      label={selectedItem?.sku} 
                      sx={{ 
                        bgcolor: 'rgba(108, 99, 255, 0.1)', 
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        mt: 0.5
                      }} 
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">Category</Typography>
                    <Typography fontWeight={500}>{selectedItem?.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">Current Stock</Typography>
                    <Typography fontWeight={500}>{selectedItem?.stock} units</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">Threshold</Typography>
                    <Typography fontWeight={500}>{selectedItem?.threshold}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">Status</Typography>
                    <Chip
                      label={selectedItem?.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[selectedItem?.status] 
                          ? `${statusColors[selectedItem?.status]}20` 
                          : 'rgba(204, 204, 32, 0.2)',
                        color: statusColors[selectedItem?.status] || 'var(--text-secondary)',
                        fontWeight: 600
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">Price</Typography>
                    <Typography fontWeight={500}>₱{selectedItem?.price}</Typography>
                  </Grid>
                </Grid>
                
                <Box mt={3}>
                  <Typography variant="h6" fontWeight={600} mb={2}>Actions</Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        handleAdjustmentClose();
                        handleAdjustmentOpen(selectedItem, 'add');
                      }}
                      sx={{ 
                        flexGrow: 1,
                        bgcolor: 'var(--success)',
                        '&:hover': { bgcolor: 'rgba(6, 214, 160, 0.8)' }
                      }}
                      variant="contained"
                    >
                      Add Stock
                    </Button>
                    <Button
                      startIcon={<RemoveIcon />}
                      onClick={() => {
                        handleAdjustmentClose();
                        handleAdjustmentOpen(selectedItem, 'remove');
                      }}
                      sx={{ 
                        flexGrow: 1,
                        bgcolor: 'var(--warning)',
                        '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.8)' }
                      }}
                      variant="contained"
                    >
                      Remove Stock
                    </Button>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => {
                        handleAdjustmentClose();
                        handleOpenModal(selectedItem, inventory.findIndex(item => item.id === selectedItem.id));
                      }}
                      sx={{ 
                        flexGrow: 1,
                        bgcolor: 'var(--text-primary)',
                        '&:hover': { bgcolor: 'rgba(46, 58, 140, 0.8)' }
                      }}
                      variant="contained"
                    >
                      Edit Item
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ) : (
              // Add/Remove Stock Form
              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAdjustmentSubmit(); }}>
                <Stack spacing={3} mt={1}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Current Stock</Typography>
                    <Typography variant="h4" fontWeight={700}>{selectedItem?.stock} units</Typography>
                  </Box>
                  
                  <TextField
                    label={`${adjustmentType === 'add' ? 'Add' : 'Remove'} Quantity`}
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0) {
                        setAdjustmentQuantity(value);
                      } else if (e.target.value === '') {
                        setAdjustmentQuantity('');
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                        setAdjustmentQuantity(1);
                      }
                    }}
                    inputProps={{ min: 1, step: 1 }}
                    fullWidth
                    variant="outlined"
                  />
                  
                  <Box>
                    <Typography color="text.secondary" variant="body2">New Stock Level</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: adjustmentType === 'add' ? 'var(--success)' : 'var(--warning)' }}>
                      {selectedItem ? 
                        (adjustmentType === 'add' 
                          ? Number(selectedItem.stock) + Number(adjustmentQuantity) 
                          : Math.max(0, Number(selectedItem.stock) - Number(adjustmentQuantity))) 
                        : 0} units
                    </Typography>
                  </Box>
                </Stack>
                
                <DialogActions sx={{ mt: 3 }}>
                  <Button onClick={handleAdjustmentClose}>Cancel</Button>
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={{ 
                      bgcolor: adjustmentType === 'add' ? 'var(--success)' : 'var(--warning)',
                      '&:hover': { 
                        bgcolor: adjustmentType === 'add' ? 'rgba(6, 214, 160, 0.8)' : 'rgba(255, 107, 107, 0.8)'
                      }
                    }}
                  >
                    {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
                  </Button>
                </DialogActions>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editIndex !== null ? 'Edit Inventory Item' : 'Add Inventory Item'}
            <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 16, top: 16 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleFormSubmit}>
              <Stack spacing={2} mt={1}>
                <TextField 
                  label="Item Name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="SKU" 
                  name="sku" 
                  value={form.sku} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="Price" 
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleFormChange} 
                  required 
                  inputProps={{ min: 0, step: 0.01 }} 
                  fullWidth 
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select 
                    name="category" 
                    value={form.category} 
                    onChange={handleFormChange}
                    label="Category"
                  >
                    <MenuItem value=""><em>Select Category</em></MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField 
                  label="Current Stock" 
                  name="stock" 
                  type="number" 
                  value={form.stock} 
                  onChange={handleFormChange} 
                  required 
                  inputProps={{ min: 0 }} 
                  fullWidth 
                  variant="outlined"
                />
                <TextField 
                  label="Threshold" 
                  name="threshold" 
                  type="number" 
                  value={form.threshold} 
                  onChange={handleFormChange} 
                  required 
                  inputProps={{ min: 0 }} 
                  fullWidth 
                  variant="outlined"
                />
              </Stack>
              <DialogActions sx={{ mt: 2 }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ bgcolor: 'var(--text-primary)' }}>
                  {editIndex !== null ? 'Update Item' : 'Add Item'}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2200}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMsg}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
      </Box>
    </SidebarLayout>
  );
}
