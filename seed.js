const mysql = require('mysql2/promise');

const customers = [
    { id: 101, name: 'Grace' }, { id: 102, name: 'Erika' }, { id: 103, name: 'Nopi' },
    { id: 104, name: 'Ratna' }, { id: 105, name: 'Abuk' }, { id: 106, name: 'Amay' },
    { id: 107, name: 'Iky' }, { id: 108, name: 'Ojan' }, { id: 109, name: 'Randy' },
    { id: 110, name: 'Affai' },
];

const branches = [
    { id: 1, name: 'KCU Jakarta Sudirman', city: 'Jakarta' },
    { id: 2, name: 'KCU Surabaya Tunjungan', city: 'Surabaya' },
    { id: 3, name: 'KCP Bandung Dago', city: 'Bandung' },
    { id: 4, name: 'KCP Medan Merdeka', city: 'Medan' },
];

const atms = [
    { id: 1, location: 'Mall Grand Indonesia, Jakarta', city: 'Jakarta' },
    { id: 2, location: 'Bandara Juanda, Surabaya', city: 'Surabaya' },
    { id: 3, location: 'Stasiun Bandung, Bandung', city: 'Bandung' },
    { id: 4, location: 'Plaza Medan Fair, Medan', city: 'Medan' },
];

const accounts = [
    { id: 901, customer_id: 101, branch_id: 1, product: 'Tabungan Emas', open_date: '2023-01-15', balance: 15750000 },
    { id: 902, customer_id: 102, branch_id: 2, product: 'Giro Bisnis', open_date: '2022-11-20', balance: 125200000 },
    { id: 903, customer_id: 103, branch_id: 3, product: 'Deposito Berjangka', open_date: '2024-05-10', balance: 250000000 },
    { id: 904, customer_id: 104, branch_id: 1, product: 'Tabungan Xpresi', open_date: '2023-03-01', balance: 8500000 },
    { id: 905, customer_id: 109, branch_id: 4, product: 'Tabungan Emas', open_date: '2023-08-25', balance: 22000000 },
    { id: 906, customer_id: 101, branch_id: 1, product: 'Giro Bisnis', open_date: '2021-02-12', balance: 340000000 },
    { id: 907, customer_id: 106, branch_id: 2, product: 'Tabungan Xpresi', open_date: '2024-01-30', balance: 4200000 },
];

const transactions = [
    { account_id: 901, date: '2025-10-01', amount: 1000000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 902, date: '2025-10-01', amount: -5000000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 2 },
    { account_id: 904, date: '2025-10-02', amount: 1500000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 901, date: '2025-10-02', amount: -250000, type: 'TRANSFER', channel: 'MOBILE_BANKING', atm_id: null },
    { account_id: 905, date: '2025-10-03', amount: -1000000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 4 },
    { account_id: 907, date: '2025-10-03', amount: 700000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 902, date: '2025-10-04', amount: -15000000, type: 'TRANSFER', channel: 'INTERNET_BANKING', atm_id: null },
    { account_id: 901, date: '2025-10-04', amount: -50000, type: 'PAYMENT', channel: 'MOBILE_BANKING', atm_id: null },
    { account_id: 904, date: '2025-10-05', amount: -2000000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 1 },
    { account_id: 905, date: '2025-10-05', amount: -150000, type: 'PAYMENT', channel: 'INTERNET_BANKING', atm_id: null },
];

const loans = [
    { id: 1, customer_id: 104, product: 'KPR', amount: 750000000, rate: 0.085, date: '2025-08-10', status: 'Aktif' },
    { id: 2, customer_id: 109, product: 'KTA', amount: 50000000, rate: 0.12, date: '2025-09-05', status: 'Aktif' },
    { id: 3, customer_id: 102, product: 'Kredit Usaha', amount: 1200000000, rate: 0.07, date: '2025-09-20', status: 'Aktif' },
    { id: 4, customer_id: 108, product: 'KTA', amount: 15000000, rate: 0.15, date: '2025-10-01', status: 'Lunas' },
];

const digital_logs = [
    { customer_id: 101, date: '2025-10-01', type: 'LOGIN', amount: null },
    { customer_id: 101, date: '2025-10-02', type: 'LOGIN', amount: null },
    { customer_id: 101, date: '2025-10-02', type: 'TRANSFER', amount: 250000 },
    { customer_id: 101, date: '2025-10-04', type: 'PAYMENT', amount: 50000 },
    { customer_id: 102, date: '2025-10-03', type: 'LOGIN', amount: null },
    { customer_id: 102, date: '2025-10-04', type: 'LOGIN', amount: null },
    { customer_id: 102, date: '2025-10-04', type: 'TRANSFER', amount: 15000000 },
    { customer_id: 105, date: '2025-10-05', type: 'LOGIN', amount: null },
    { customer_id: 109, date: '2025-10-05', type: 'PAYMENT', amount: 150000 },
];


async function seedDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'host.docker.internal',
            user: 'root',
            password: '',
            database: 'db_source'
        });
        console.log('Connected to db_source for seeding.');

        for (const c of customers) await connection.execute('INSERT INTO customers (id, full_name) VALUES (?, ?)', [c.id, c.name]);
        for (const b of branches) await connection.execute('INSERT INTO branches (id, branch_name, city) VALUES (?, ?, ?)', [b.id, b.name, b.city]);
        for (const a of atms) await connection.execute('INSERT INTO atms (id, location, city) VALUES (?, ?, ?)', [a.id, a.location, a.city]);
        for (const a of accounts) await connection.execute('INSERT INTO accounts (id, customer_id, branch_id, product_name, open_date, balance) VALUES (?, ?, ?, ?, ?, ?)', [a.id, a.customer_id, a.branch_id, a.product, a.open_date, a.balance]);
        for (const t of transactions) await connection.execute('INSERT INTO transactions (account_id, date, amount, type, channel, atm_id) VALUES (?, ?, ?, ?, ?, ?)', [t.account_id, t.date, t.amount, t.type, t.channel, t.atm_id]);
        for (const l of loans) await connection.execute('INSERT INTO loans (id, customer_id, loan_product, principal_amount, interest_rate, origination_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [l.id, l.customer_id, l.product, l.amount, l.rate, l.date, l.status]);
        for (const d of digital_logs) await connection.execute('INSERT INTO digital_logs (customer_id, date, activity_type, amount) VALUES (?, ?, ?, ?)', [d.customer_id, d.date, d.type, d.amount]);
        
        console.log('Sample banking data has been inserted into db_source.');

    } catch (err) {
        console.error('Error seeding database:', err.message);
    } finally {
        if (connection) await connection.end();
        console.log('Seeding connection closed.');
    }
}

seedDatabase();