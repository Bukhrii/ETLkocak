const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'host.docker.internal',
    user: 'root',
    password: ''
};

const sourceDbName = 'db_source';
const destDbName = 'db_datawarehouse';

const sourceSchema = [
    `CREATE TABLE customers (id INTEGER PRIMARY KEY, full_name TEXT)`,
    `CREATE TABLE accounts (id INTEGER PRIMARY KEY, customer_id INTEGER, branch_id INTEGER, product_name TEXT, open_date TEXT, balance REAL)`,
    `CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTO_INCREMENT, account_id INTEGER, date TEXT, amount REAL, type TEXT, channel TEXT, atm_id INTEGER)`,
    `CREATE TABLE loans (id INTEGER PRIMARY KEY, customer_id INTEGER, loan_product TEXT, principal_amount REAL, interest_rate REAL, origination_date TEXT, status TEXT)`,
    `CREATE TABLE digital_logs (id INTEGER PRIMARY KEY AUTO_INCREMENT, customer_id INTEGER, date TEXT, activity_type TEXT, amount REAL)`,
    `CREATE TABLE branches (id INTEGER PRIMARY KEY, branch_name TEXT, city TEXT)`,
    `CREATE TABLE atms (id INTEGER PRIMARY KEY, location TEXT, city TEXT)`
];

const destinationSchema = [
    `CREATE TABLE Dim_Nasabah (customer_key INTEGER PRIMARY KEY, full_name TEXT)`,
    `CREATE TABLE Dim_Waktu (date_key INTEGER PRIMARY KEY, full_date TEXT, year INTEGER, month INTEGER)`,
    `CREATE TABLE Dim_Rekening (account_key INTEGER PRIMARY KEY)`,
    `CREATE TABLE Dim_Cabang (branch_key INTEGER PRIMARY KEY, branch_name TEXT)`,
    `CREATE TABLE Dim_ATM (atm_key INTEGER PRIMARY KEY, location TEXT)`,
    `CREATE TABLE Dim_Kanal (channel_key INTEGER PRIMARY KEY AUTO_INCREMENT, channel_name VARCHAR(255) UNIQUE)`,
    `CREATE TABLE Dim_Produk_Deposito (product_key INTEGER PRIMARY KEY AUTO_INCREMENT, product_name VARCHAR(255) UNIQUE)`,
    `CREATE TABLE Fact_Transaction (transaction_key INTEGER PRIMARY KEY AUTO_INCREMENT, date_key INTEGER, customer_key INTEGER, account_key INTEGER, amount REAL)`,
    `CREATE TABLE Fact_Loan (loan_key INTEGER PRIMARY KEY, origination_date_key INTEGER, customer_key INTEGER, jumlah_pinjaman REAL)`,
    `CREATE TABLE Fact_Deposit (deposit_key INTEGER PRIMARY KEY, date_key INTEGER, customer_key INTEGER, product_key INTEGER, saldo_deposito REAL)`,
    `CREATE TABLE Fact_Account_Balance (balance_key INTEGER PRIMARY KEY, date_key INTEGER, account_key INTEGER, saldo_harian REAL)`,
    `CREATE TABLE Fact_ATM_Usage (atm_usage_key INTEGER PRIMARY KEY AUTO_INCREMENT, date_key INTEGER, customer_key INTEGER, atm_key INTEGER, jumlah_transaksi_atm INTEGER, total_uang_ditarik REAL)`,
    `CREATE TABLE Fact_Internet_Banking (digital_usage_key INTEGER PRIMARY KEY AUTO_INCREMENT, date_key INTEGER, customer_key INTEGER, jumlah_login INTEGER, jumlah_transfer_online INTEGER)`
];


async function setupDatabases() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        await connection.query(`DROP DATABASE IF EXISTS ${sourceDbName}`);
        await connection.query(`CREATE DATABASE ${sourceDbName}`);
        await connection.changeUser({ database: sourceDbName });
        console.log(`Database ${sourceDbName} created.`);
        for (const statement of sourceSchema) {
            await connection.query(statement);
        }
        console.log(`Tables for ${sourceDbName} created.`);

        await connection.query(`DROP DATABASE IF EXISTS ${destDbName}`);
        await connection.query(`CREATE DATABASE ${destDbName}`);
        await connection.changeUser({ database: destDbName });
        console.log(`Database ${destDbName} created.`);
        for (const statement of destinationSchema) {
            await connection.query(statement);
        }
        console.log(`Tables for ${destDbName} created.`);

    } catch (err) {
        console.error('Error setting up databases:', err.message);
    } finally {
        if (connection) await connection.end();
        console.log('Setup connection closed.');
    }
}

setupDatabases();