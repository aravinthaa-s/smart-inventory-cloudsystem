-- Azure SQL Database Schema for Smart Inventory

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL -- 'Admin' or 'Staff'
);

CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    ContactEmail NVARCHAR(100),
    Phone NVARCHAR(20)
);

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Quantity INT NOT NULL DEFAULT 0,
    Price DECIMAL(10, 2) NOT NULL,
    SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id)
);

CREATE TABLE Transactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT FOREIGN KEY REFERENCES Products(Id),
    Type NVARCHAR(20) NOT NULL, -- 'StockIn' or 'StockOut'
    Quantity INT NOT NULL,
    Date DATETIME DEFAULT GETDATE(),
    UserId INT FOREIGN KEY REFERENCES Users(Id)
);

-- Insert Mock Data
INSERT INTO Users (Username, PasswordHash, Role) VALUES ('admin', 'hashed_pwd_here', 'Admin');
INSERT INTO Suppliers (Name, ContactEmail, Phone) VALUES ('Azure Hardware Co.', 'supply@azurehw.com', '1234567890');
INSERT INTO Products (Name, Description, Quantity, Price, SupplierId) VALUES ('Cloud Server Rack', 'Standard 42U rack', 5, 1200.00, 1);
INSERT INTO Products (Name, Description, Quantity, Price, SupplierId) VALUES ('Network Switch', '24 port gigabit switch', 15, 300.00, 1);
