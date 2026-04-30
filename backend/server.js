require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- USERS ---
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Username', sql.NVarChar, username)
      .query('SELECT Id, Username, PasswordHash, Role FROM Users WHERE Username = @Username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({ success: true, user: { Id: user.Id, Username: user.Username, Role: user.Role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('PasswordHash', sql.NVarChar, hash)
      .input('Role', sql.NVarChar, role || 'Staff')
      .query('INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @PasswordHash, @Role)');
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Suppliers');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.*, s.Name as SupplierName 
      FROM Products p 
      LEFT JOIN Suppliers s ON p.SupplierId = s.Id
    `);
    // Map to frontend expected format
    const products = result.recordset.map(p => ({
      id: p.Id,
      name: p.Name,
      sku: `SKU-${p.Id}`,
      quantity: p.Quantity,
      price: p.Price,
      supplierId: p.SupplierId,
      description: p.Description
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, quantity, price, supplierId } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description || '')
      .input('Quantity', sql.Int, quantity)
      .input('Price', sql.Decimal(10, 2), price)
      .input('SupplierId', sql.Int, supplierId || 1) // default to 1 if not provided
      .query('INSERT INTO Products (Name, Description, Quantity, Price, SupplierId) VALUES (@Name, @Description, @Quantity, @Price, @SupplierId)');
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, id)
      .input('Name', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description || '')
      .input('Quantity', sql.Int, quantity)
      .input('Price', sql.Decimal(10, 2), price)
      .query('UPDATE Products SET Name=@Name, Description=@Description, Quantity=@Quantity, Price=@Price WHERE Id=@Id');
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Products WHERE Id=@Id');
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRANSACTIONS ---
app.get('/api/transactions', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT TOP 10 * FROM Transactions ORDER BY Date DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { productId, type, quantity, userId } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('ProductId', sql.Int, productId)
      .input('Type', sql.NVarChar, type)
      .input('Quantity', sql.Int, quantity)
      .input('UserId', sql.Int, userId || 1)
      .query('INSERT INTO Transactions (ProductId, Type, Quantity, UserId) VALUES (@ProductId, @Type, @Quantity, @UserId)');
      
    // Update product quantity based on transaction
    if (type === 'StockIn') {
      await pool.request()
        .input('ProductId', sql.Int, productId)
        .input('Quantity', sql.Int, quantity)
        .query('UPDATE Products SET Quantity = Quantity + @Quantity WHERE Id = @ProductId');
    } else if (type === 'StockOut') {
      await pool.request()
        .input('ProductId', sql.Int, productId)
        .input('Quantity', sql.Int, quantity)
        .query('UPDATE Products SET Quantity = Quantity - @Quantity WHERE Id = @ProductId');
    }
      
    res.status(201).json({ message: 'Transaction recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DASHBOARD ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const pool = await poolPromise;
    const statsResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Products) as TotalProducts,
        (SELECT COUNT(*) FROM Products WHERE Quantity <= 10) as LowStockItems,
        (SELECT COUNT(*) FROM Transactions) as TotalTransactions
    `);
    
    // Mock chart data for now, or fetch from transactions if we have a lot
    const chartData = [
      { name: 'Jan', stockIn: 400, stockOut: 240 },
      { name: 'Feb', stockIn: 300, stockOut: 139 },
      { name: 'Mar', stockIn: 200, stockOut: 980 },
      { name: 'Apr', stockIn: 278, stockOut: 390 },
      { name: 'May', stockIn: 189, stockOut: 480 },
    ];

    res.json({
      stats: {
        total: statsResult.recordset[0].TotalProducts,
        lowStock: statsResult.recordset[0].LowStockItems,
        transactions: statsResult.recordset[0].TotalTransactions
      },
      chartData: chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI ---
app.post('/api/ask-ai', (req, res) => {
  // User explicitly requested: "for ai alone in the bakcend have the end point that returns hi"
  res.json({ reply: 'hi' });
});

// --- REPORTS ---
app.get('/api/reports', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Products');
    res.json({ products: result.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
