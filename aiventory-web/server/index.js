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
app.use(cors());
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