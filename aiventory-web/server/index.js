import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "aiventory_secret_fallback";

// ------------------ INIT ------------------
const app = express();

// Configure CORS to allow requests from Vercel frontend
const corsOptions = {
  origin: ['https://aiventory1vercel.vercel.app', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
app.use(express.json());

// Supabase connection
console.log("Attempting to connect to Supabase with URL:", `https://${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]}`);
const supabaseUrl = `https://${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]}`;
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test Supabase connection
supabase.from('product').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
    } else {
      console.log("✅ Connected to Supabase database");
      console.log("Test query successful, found", data.length, "products");
    }
  })
  .catch(err => {
    console.error("❌ Supabase connection error:", err.message);
  });

// ------------------ ROUTES ------------------

// Registration route
app.post("/api/register", async (req, res) => {
  const { fullName, name, email, username, password, role } = req.body;
  // Use fullName if provided, otherwise use name
  const actualName = fullName || name;
  console.log("📥 Registration request:", { name: actualName, email, username, password, role });
  
  // Validate required fields
  if (!actualName || !email || !username || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const table = role === 'Admin' ? 'admin' : 'staff';
  const email_field = role === 'Admin' ? 'admin_email' : 'staff_email';
  const password_field = role === 'Admin' ? 'admin_password' : 'staff_password';
  const name_field = role === 'Admin' ? 'admin_name' : 'staff_name';
  const username_field = role === 'Admin' ? 'admin_username' : 'staff_username';
  
  try {
    // Check if user already exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .or(`${email_field}.eq.${email},${username_field}.eq.${username}`);
    
    if (fetchError) {
      console.error("❌ Supabase fetch error:", fetchError.message);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (existingUsers.length > 0) {
      console.log("❌ User already exists:", email, username);
      return res.status(409).json({ error: "User already exists" });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const { data, error } = await supabase
      .from(table)
      .insert({
        [name_field]: actualName,
        [email_field]: email,
        [username_field]: username,
        [password_field]: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({ error: "Database error" });
    }
    
    console.log("✅ Registration successful for:", actualName);
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ error: "Registration error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, username, password, role } = req.body;
  console.log("📥 Login request:", { email, username, password, role });
  
  // Validate required fields
  if (!password || !role) {
    return res.status(400).json({ error: "Missing email/username, password, or role" });
  }
  
  // Accept either email or username from frontend
  const identifier = email || username;
  if (!identifier) {
    return res.status(400).json({ error: "Email or username is required" });
  }

  const table = role === 'Admin' ? 'admin' : 'staff';
  const id_field = role === 'Admin' ? 'admin_id' : 'staff_id';
  const email_field = role === 'Admin' ? 'admin_email' : 'staff_email';
  const password_field = role === 'Admin' ? 'admin_password' : 'staff_password';
  const name_field = role === 'Admin' ? 'admin_name' : 'staff_name';

  try {
    // Try to match by email or username
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .or(`${email_field}.eq.${identifier},${name_field === 'admin_name' ? 'admin_username' : 'staff_username'}.eq.${identifier}`);
    
    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (data.length === 0) {
      console.log("❌ User not found:", identifier);
      return res.status(401).json({ error: "User not found" });
    }

    const user = data[0];
    
    const passwordMatch = await bcrypt.compare(password, user[password_field]);
    
    if (!passwordMatch) {
      console.log("❌ Invalid password for user:", identifier);
      return res.status(401).json({ error: "Invalid password" });
    }

    // Update last login
    const { error: updateError } = await supabase
      .from(table)
      .update({ last_login: new Date().toISOString() })
      .eq(id_field, user[id_field]);
    
    if (updateError) {
      console.error("❌ Update login time error:", updateError);
      // Don't fail login for this error
    }

    const token = jwt.sign({ id: user[id_field], role: role }, SECRET_KEY, { expiresIn: "2h" });
    console.log("✅ Login successful for:", user[name_field]);
    
    // Return user info for frontend
    res.json({ 
      message: "Login success", 
      token, 
      role: role, 
      user: { 
        id: user[id_field], 
        name: user[name_field], 
        email: user[email_field] 
      } 
    });
  } catch (err) {
    console.error("❌ Database Error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Products Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Products Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get all suppliers
app.get("/api/suppliers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supplier')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Suppliers Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Suppliers Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Add new product
app.post("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .insert(req.body)
      .select();
    
    if (error) {
      console.error("❌ Add Product Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("❌ Add Product Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('product')
      .update(req.body)
      .eq('product_id', id)
      .select();
    
    if (error) {
      console.error("❌ Update Product Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error("❌ Update Product Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('product')
      .delete()
      .eq('product_id', id);
    
    if (error) {
      console.error("❌ Delete Product Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error("❌ Delete Product Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get all invoices
app.get("/api/invoices", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Invoices Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Invoices Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Add new invoice
app.post("/api/invoices", async (req, res) => {
  try {
    // First create the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: req.body.invoice_number,
        invoice_date: req.body.invoice_date,
        due_date: req.body.due_date,
        status: req.body.status,
        customer_name: req.body.customer_name,
        customer_phone: req.body.customer_phone,
        customer_address: req.body.customer_address,
        notes: req.body.notes,
        subtotal: req.body.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0,
        tax: req.body.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 0.05 || 0,
        total: req.body.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 1.05 || 0
      })
      .select();
    
    if (invoiceError) {
      console.error("❌ Add Invoice Error:", invoiceError.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: invoiceError.message
      });
    }
    
    const invoice = invoiceData[0];
    
    // Then create the invoice items
    if (req.body.items && req.body.items.length > 0) {
      const itemsToInsert = req.body.items.map(item => ({
        invoice_id: invoice.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_id: item.product_id
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
      
      if (itemsError) {
        console.error("❌ Add Invoice Items Error:", itemsError.message);
        // Try to delete the invoice if items failed to insert
        await supabase
          .from('invoices')
          .delete()
          .eq('invoice_id', invoice.invoice_id);
        return res.status(500).json({ 
          error: "Database error", 
          message: itemsError.message
        });
      }
    }
    
    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .eq('invoice_id', invoice.invoice_id)
      .single();
    
    if (fetchError) {
      console.error("❌ Fetch Complete Invoice Error:", fetchError.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: fetchError.message
      });
    }
    
    res.status(201).json(completeInvoice);
  } catch (err) {
    console.error("❌ Add Invoice Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get invoice items
app.get("/api/invoice-items", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Invoice Items Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Invoice Items Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get all suppliers
app.get("/api/suppliers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supplier')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Suppliers Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Suppliers Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get all orders from supplier
app.get("/api/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders_from_supplier')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Orders Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Orders Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Get all notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*');
    
    if (error) {
      console.error("❌ Fetch Notifications Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error("❌ Fetch Notifications Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Add new supplier
app.post("/api/suppliers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supplier')
      .insert(req.body)
      .select();
    
    if (error) {
      console.error("❌ Add Supplier Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("❌ Add Supplier Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Update supplier
app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('supplier')
      .update(req.body)
      .eq('supplier_id', id)
      .select();
    
    if (error) {
      console.error("❌ Update Supplier Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error("❌ Update Supplier Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Delete supplier
app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('supplier')
      .delete()
      .eq('supplier_id', id);
    
    if (error) {
      console.error("❌ Delete Supplier Error:", error.message);
      return res.status(500).json({ 
        error: "Database error", 
        message: error.message
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error("❌ Delete Supplier Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// Server-Sent Events for real-time updates
app.get('/api/events', (req, res) => {
  // Set CORS headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send a heartbeat message every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 30000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Dashboard metrics
app.get("/api/dashboard/metrics", async (req, res) => {
  try {
    // Get total items
    const { count: totalItems, error: totalError } = await supabase
      .from('product')
      .select('*', { count: 'exact' });
    
    if (totalError) {
      throw new Error(totalError.message);
    }
    
    // Get low stock items
    const { count: lowStock, error: lowError } = await supabase
      .from('product')
      .select('*', { count: 'exact' })
      .lte('product_stock', 'reorder_level');
    
    if (lowError) {
      throw new Error(lowError.message);
    }
    
    // Get inventory value
    const { data: inventoryData, error: valueError } = await supabase
      .from('product')
      .select('product_stock, product_price');
    
    if (valueError) {
      throw new Error(valueError.message);
    }
    
    const inventoryValue = inventoryData.reduce((sum, item) => {
      return sum + (item.product_stock * item.product_price);
    }, 0);
    
    res.json({
      total_items: totalItems || 0,
      low_stock_count: lowStock || 0,
      inventory_value: inventoryValue || 0
    });
  } catch (err) {
    console.error("❌ Dashboard Metrics Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      message: err.message
    });
  }
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
});