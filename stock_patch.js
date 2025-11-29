// Update stock with movement tracking
app.patch("/api/items/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { quantity, action, reason, reference, staff_id, user_name } = req.body;
  
  if (!quantity || !action) {
    return res.status(400).json({ error: "Missing required fields: quantity and action" });
  }
  
  if (action !== 'add' && action !== 'remove') {
    return res.status(400).json({ error: "Action must be 'add' or 'remove'" });
  }
  
  try {
    // Get current product
    const { data: products, error: fetchError } = await supabase
      .from('product')
      .select('product_stock, product_name, reorder_level')
      .eq('product_id', id);
    
    if (fetchError) {
      console.error("❌ Fetch Product Error:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }
    
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const product = products[0];
    const currentStock = Number(product.product_stock) || 0;
    const quantityNum = Number(quantity);
    
    // Calculate new stock
    const newStock = action === 'add' 
      ? currentStock + quantityNum 
      : currentStock - quantityNum;
    
    if (newStock < 0) {
      return res.status(400).json({ error: "Cannot remove more stock than available" });
    }
    
    // Update product stock
    const { error: updateError } = await supabase
      .from('product')
      .update({ 
        product_stock: newStock, 
        updated_at: new Date().toISOString() 
      })
      .eq('product_id', id);
    
    if (updateError) {
      console.error("❌ Update Stock Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }
    
    // Record stock movement
    const movementType = action === 'add' ? 'in' : 'out';
    const staffId = Number(staff_id) || 1;
    
    const { error: movementError } = await supabase
      .from('stock_movement')
      .insert({
        stock_movement_type: movementType,
        stock_movement_quantity: quantityNum,
        inventory_id: id,
        staff_id: staffId
      });
    
    if (movementError) {
      console.error("⚠️ Stock movement insert failed:", movementError.message);
    }
    
    // Check if stock dropped below threshold and create notification
    if (newStock <= product.reorder_level) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: 'Low Stock Alert',
          message: `${product.product_name} is running low (${newStock} units left). Threshold: ${product.reorder_level}`,
          item_name: product.product_name,
          action: 'low_stock',
          user_name: user_name || 'System',
          user_id: staffId
        });
      
      if (notificationError) {
        console.error("⚠️ Notification insert failed:", notificationError.message);
      }
    }
    
    // Send SSE event for real-time updates
    // Note: SSE implementation would go here if needed
    
    res.json({ 
      message: 'Stock updated successfully', 
      stock: newStock, 
      new_stock: newStock, 
      old_stock: currentStock, 
      quantity: quantityNum, 
      action 
    });
  } catch (err) {
    console.error("❌ Update Stock Error:", err);
    return res.status(500).json({ error: err.message });
  }
});