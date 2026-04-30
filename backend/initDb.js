require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('./db');

async function initDb() {
    try {
        const pool = await poolPromise;

        // --- Create Tables (if not exist) ---
        const queries = [
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
             CREATE TABLE Users (
                 Id INT IDENTITY(1,1) PRIMARY KEY,
                 Username NVARCHAR(50) NOT NULL UNIQUE,
                 PasswordHash NVARCHAR(255) NOT NULL,
                 Role NVARCHAR(20) NOT NULL
             );`,
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Suppliers' AND xtype='U')
             CREATE TABLE Suppliers (
                 Id INT IDENTITY(1,1) PRIMARY KEY,
                 Name NVARCHAR(100) NOT NULL,
                 ContactEmail NVARCHAR(100),
                 Phone NVARCHAR(20)
             );`,
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
             CREATE TABLE Products (
                 Id INT IDENTITY(1,1) PRIMARY KEY,
                 Name NVARCHAR(100) NOT NULL,
                 Description NVARCHAR(255),
                 Quantity INT NOT NULL DEFAULT 0,
                 Price DECIMAL(10, 2) NOT NULL,
                 SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id)
             );`,
            `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
             CREATE TABLE Transactions (
                 Id INT IDENTITY(1,1) PRIMARY KEY,
                 ProductId INT FOREIGN KEY REFERENCES Products(Id),
                 Type NVARCHAR(20) NOT NULL,
                 Quantity INT NOT NULL,
                 Date DATETIME DEFAULT GETDATE(),
                 UserId INT FOREIGN KEY REFERENCES Users(Id)
             );`
        ];

        for (let q of queries) {
            await pool.request().query(q);
        }
        console.log('✅ Tables created or already exist.');

        // --- Seed Data (only if Users table is empty) ---
        const usersResult = await pool.request().query('SELECT COUNT(*) as count FROM Users');
        if (usersResult.recordset[0].count === 0) {
            const adminHash = await bcrypt.hash('admin123', 10);
            const staffHash = await bcrypt.hash('staff123', 10);

            await pool.request()
                .input('Username', sql.NVarChar, 'admin')
                .input('PasswordHash', sql.NVarChar, adminHash)
                .input('Role', sql.NVarChar, 'Admin')
                .query('INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @PasswordHash, @Role)');

            await pool.request()
                .input('Username', sql.NVarChar, 'staff')
                .input('PasswordHash', sql.NVarChar, staffHash)
                .input('Role', sql.NVarChar, 'Staff')
                .query('INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @PasswordHash, @Role)');

            console.log('✅ Default users created:');
            console.log('   admin / admin123 (Admin)');
            console.log('   staff / staff123 (Staff)');
        } else {
            console.log('ℹ️  Users already exist, skipping user seed.');
        }

        // --- Seed Suppliers & Products (only if empty) ---
        const suppliersResult = await pool.request().query('SELECT COUNT(*) as count FROM Suppliers');
        if (suppliersResult.recordset[0].count === 0) {
            await pool.request().query("INSERT INTO Suppliers (Name, ContactEmail, Phone) VALUES ('Azure Hardware Co.', 'supply@azurehw.com', '1234567890')");
            await pool.request().query("INSERT INTO Products (Name, Description, Quantity, Price, SupplierId) VALUES ('Cloud Server Rack', 'Standard 42U rack', 5, 1200.00, 1)");
            await pool.request().query("INSERT INTO Products (Name, Description, Quantity, Price, SupplierId) VALUES ('Network Switch', '24 port gigabit switch', 15, 300.00, 1)");
            console.log('✅ Mock products and suppliers inserted.');
        }

        console.log('🚀 Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
}

initDb();
