const sqlite3 = require('sqlite3').verbose();

const createSourceDatabase = () => {
    const db = new sqlite3.Database('./source.db', err => {
        if (err) return console.error('Error connecting to source DB:', err.message);
        console.log('Connected to the source SQLite database.');
    });

    db.serialize(() => {
        console.log('Creating source tables for Banking');
        db.run(`DROP TABLE IF EXISTS customers`);
        db.run(`CREATE TABLE customers (id INTEGER PRIMARY KEY, full_name TEXT)`);

        db.run(`DROP TABLE IF EXISTS accounts`);
        db.run(`CREATE TABLE accounts (id INTEGER PRIMARY KEY, customer_id INTEGER, branch_id INTEGER, product_name TEXT, open_date TEXT, balance REAL)`);
        
        db.run(`DROP TABLE IF EXISTS transactions`);
        db.run(`CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER, date TEXT, amount REAL, type TEXT, channel TEXT, atm_id INTEGER)`);
        
        db.run(`DROP TABLE IF EXISTS loans`);
        db.run(`CREATE TABLE loans (id INTEGER PRIMARY KEY, customer_id INTEGER, loan_product TEXT, principal_amount REAL, interest_rate REAL, origination_date TEXT, status TEXT)`);
        
        db.run(`DROP TABLE IF EXISTS digital_logs`);
        db.run(`CREATE TABLE digital_logs (id INTEGER PRIMARY KEY, customer_id INTEGER, date TEXT, activity_type TEXT, amount REAL)`);

        db.run(`DROP TABLE IF EXISTS branches`);
        db.run(`CREATE TABLE branches (id INTEGER PRIMARY KEY, branch_name TEXT, city TEXT)`);
        
        db.run(`DROP TABLE IF EXISTS atms`);
        db.run(`CREATE TABLE atms (id INTEGER PRIMARY KEY, location TEXT, city TEXT)`);
    });

    db.close(err => {
        if (err) return console.error('Error closing source DB:', err.message);
        console.log('Source database schema created and connection closed.');
    });
};

const createDestinationDatabase = () => {
    const db = new sqlite3.Database('./destination.db', err => {
        if (err) return console.error('Error connecting to destination DB:', err.message);
        console.log('Connected to the destination SQLite database.');
    });

    db.serialize(() => {
        console.log('Creating destination tables/Dimensions and Facts');

        db.run(`DROP TABLE IF EXISTS Dim_Nasabah`);
        db.run(`CREATE TABLE Dim_Nasabah (customer_key INTEGER PRIMARY KEY, full_name TEXT)`);
        
        db.run(`DROP TABLE IF EXISTS Dim_Waktu`);
        db.run(`CREATE TABLE Dim_Waktu (date_key INTEGER PRIMARY KEY, full_date TEXT, year INTEGER, month INTEGER)`);
        
        db.run(`DROP TABLE IF EXISTS Dim_Rekening`);
        db.run(`CREATE TABLE Dim_Rekening (account_key INTEGER PRIMARY KEY)`);

        db.run(`DROP TABLE IF EXISTS Dim_Cabang`);
        db.run(`CREATE TABLE Dim_Cabang (branch_key INTEGER PRIMARY KEY, branch_name TEXT)`);

        db.run(`DROP TABLE IF EXISTS Dim_ATM`);
        db.run(`CREATE TABLE Dim_ATM (atm_key INTEGER PRIMARY KEY, location TEXT)`);

        db.run(`DROP TABLE IF EXISTS Dim_Kanal`);
        db.run(`CREATE TABLE Dim_Kanal (channel_key INTEGER PRIMARY KEY AUTOINCREMENT, channel_name TEXT UNIQUE)`);

        db.run(`DROP TABLE IF EXISTS Dim_Produk_Deposito`);
        db.run(`CREATE TABLE Dim_Produk_Deposito (product_key INTEGER PRIMARY KEY AUTOINCREMENT, product_name TEXT UNIQUE)`);

        db.run(`DROP TABLE IF EXISTS Fact_Transaction`);
        db.run(`CREATE TABLE Fact_Transaction (transaction_key INTEGER PRIMARY KEY, date_key INTEGER, customer_key INTEGER, account_key INTEGER, amount REAL)`);
        
        db.run(`DROP TABLE IF EXISTS Fact_Loan`);
        db.run(`CREATE TABLE Fact_Loan (loan_key INTEGER PRIMARY KEY, origination_date_key INTEGER, customer_key INTEGER, jumlah_pinjaman REAL)`);
        
        db.run(`DROP TABLE IF EXISTS Fact_Deposit`);
        db.run(`CREATE TABLE Fact_Deposit (deposit_key INTEGER PRIMARY KEY, date_key INTEGER, customer_key INTEGER, product_key INTEGER, saldo_deposito REAL)`);

        db.run(`DROP TABLE IF EXISTS Fact_Account_Balance`);
        db.run(`CREATE TABLE Fact_Account_Balance (balance_key INTEGER PRIMARY KEY, date_key INTEGER, account_key INTEGER, saldo_harian REAL)`);

        db.run(`DROP TABLE IF EXISTS Fact_ATM_Usage`);
        db.run(`CREATE TABLE Fact_ATM_Usage (atm_usage_key INTEGER PRIMARY KEY, date_key INTEGER, customer_key INTEGER, atm_key INTEGER, jumlah_transaksi_atm INTEGER, total_uang_ditarik REAL)`);
        
        db.run(`DROP TABLE IF EXISTS Fact_Internet_Banking`);
        db.run(`CREATE TABLE Fact_Internet_Banking (digital_usage_key INTEGER PRIMARY KEY, date_key INTEGER, customer_key INTEGER, jumlah_login INTEGER, jumlah_transfer_online INTEGER)`);
    });

    db.close(err => {
        if (err) return console.error('Error closing destination DB:', err.message);
        console.log('Destination database schema created and connection closed.');
    });
};

createSourceDatabase();
createDestinationDatabase();