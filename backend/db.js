const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '', // Default to empty string to avoid TypeError
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: false 
  }
};

// Only attempt to connect if the server is actually configured
let poolPromise;
if (process.env.DB_SERVER) {
  poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      console.log('Connected to Azure SQL Database');
      return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err.message));
} else {
  console.log('⚠️ Warning: No DB_SERVER provided in environment variables. Running without database connection.');
  // Return a mock rejected promise to prevent crashing when queries are attempted
  poolPromise = Promise.reject(new Error("Database not configured."));
}

module.exports = {
  sql, poolPromise
};
