require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('./db');

async function resetPasswords() {
    try {
        const pool = await poolPromise;

        const adminHash = await bcrypt.hash('admin123', 10);
        const staffHash = await bcrypt.hash('staff123', 10);

        // Update admin user
        const r1 = await pool.request()
            .input('Hash', sql.NVarChar, adminHash)
            .input('Username', sql.NVarChar, 'admin')
            .query('UPDATE Users SET PasswordHash = @Hash WHERE Username = @Username');
        
        console.log('✅ admin password updated →', r1.rowsAffected[0] > 0 ? 'OK' : 'User not found');

        // Upsert staff user
        const existing = await pool.request()
            .input('Username', sql.NVarChar, 'staff')
            .query('SELECT Id FROM Users WHERE Username = @Username');

        if (existing.recordset.length > 0) {
            await pool.request()
                .input('Hash', sql.NVarChar, staffHash)
                .input('Username', sql.NVarChar, 'staff')
                .query('UPDATE Users SET PasswordHash = @Hash WHERE Username = @Username');
            console.log('✅ staff password updated → OK');
        } else {
            await pool.request()
                .input('Username', sql.NVarChar, 'staff')
                .input('PasswordHash', sql.NVarChar, staffHash)
                .input('Role', sql.NVarChar, 'Staff')
                .query('INSERT INTO Users (Username, PasswordHash, Role) VALUES (@Username, @PasswordHash, @Role)');
            console.log('✅ staff user created → OK');
        }

        console.log('\n🔑 Login credentials:');
        console.log('   Username: admin    Password: admin123');
        console.log('   Username: staff    Password: staff123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

resetPasswords();
