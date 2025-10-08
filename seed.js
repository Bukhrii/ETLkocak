const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./source.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to source.db for seeding with larger dataset.');
});


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
    { id: 1, location: 'Mall Grand Indonesia, Jakarta' },
    { id: 2, location: 'Bandara Juanda, Surabaya' },
    { id: 3, location: 'Stasiun Bandung, Bandung' },
    { id: 4, location: 'Plaza Medan Fair, Medan' },
];

const accounts = [
    { id: 901, customer_id: 101, branch_id: 1, product: 'Tabungan Emas', balance: 15_750_000 },
    { id: 902, customer_id: 102, branch_id: 2, product: 'Giro Bisnis', balance: 125_200_000 },
    { id: 903, customer_id: 103, branch_id: 3, product: 'Deposito Berjangka', balance: 250_000_000 },
    { id: 904, customer_id: 104, branch_id: 1, product: 'Tabungan Xpresi', balance: 8_500_000 },
    { id: 905, customer_id: 109, branch_id: 4, product: 'Tabungan Emas', balance: 22_000_000 },
    { id: 906, customer_id: 101, branch_id: 1, product: 'Giro Bisnis', balance: 340_000_000 },
    { id: 907, customer_id: 106, branch_id: 2, product: 'Tabungan Xpresi', balance: 4_200_000 },
];

const transactions = [
    { account_id: 901, date: '2025-10-01', amount: 1_000_000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 902, date: '2025-10-01', amount: -5_000_000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 2 },
    { account_id: 904, date: '2025-10-02', amount: 1_500_000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 901, date: '2025-10-02', amount: -250_000, type: 'TRANSFER', channel: 'MOBILE_BANKING', atm_id: null },
    { account_id: 905, date: '2025-10-03', amount: -1_000_000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 4 },
    { account_id: 907, date: '2025-10-03', amount: 700_000, type: 'DEPOSIT', channel: 'TELLER', atm_id: null },
    { account_id: 902, date: '2025-10-04', amount: -15_000_000, type: 'TRANSFER', channel: 'INTERNET_BANKING', atm_id: null },
    { account_id: 901, date: '2025-10-04', amount: -50_000, type: 'PAYMENT', channel: 'MOBILE_BANKING', atm_id: null },
    { account_id: 904, date: '2025-10-05', amount: -2_000_000, type: 'WITHDRAWAL', channel: 'ATM', atm_id: 1 },
    { account_id: 905, date: '2025-10-05', amount: -150_000, type: 'PAYMENT', channel: 'INTERNET_BANKING', atm_id: null },
];

const loans = [
    { id: 1, customer_id: 104, product: 'KPR', amount: 750_000_000, rate: 0.085, date: '2025-08-10', status: 'Aktif' },
    { id: 2, customer_id: 109, product: 'KTA', amount: 50_000_000, rate: 0.12, date: '2025-09-05', status: 'Aktif' },
    { id: 3, customer_id: 102, product: 'Kredit Usaha', amount: 1_200_000_000, rate: 0.07, date: '2025-09-20', status: 'Aktif' },
    { id: 4, customer_id: 108, product: 'KTA', amount: 15_000_000, rate: 0.15, date: '2025-10-01', status: 'Lunas' },
];

const digital_logs = [
    { customer_id: 101, date: '2025-10-01', type: 'LOGIN', amount: null },
    { customer_id: 101, date: '2025-10-02', type: 'LOGIN', amount: null },
    { customer_id: 101, date: '2025-10-02', type: 'TRANSFER', amount: 250_000 },
    { customer_id: 101, date: '2025-10-04', type: 'PAYMENT', amount: 50_000 },
    { customer_id: 102, date: '2025-10-03', type: 'LOGIN', amount: null },
    { customer_id: 102, date: '2025-10-04', type: 'LOGIN', amount: null },
    { customer_id: 102, date: '2025-10-04', type: 'TRANSFER', amount: 15_000_000 },
    { customer_id: 105, date: '2025-10-05', type: 'LOGIN', amount: null },
    { customer_id: 109, date: '2025-10-05', type: 'PAYMENT', amount: 150_000 },
];


db.serialize(() => {
    customers.forEach(c => db.run('INSERT INTO customers (id, full_name) VALUES (?, ?)', [c.id, c.name]));
    branches.forEach(b => db.run('INSERT INTO branches (id, branch_name) VALUES (?, ?)', [b.id, b.name]));
    atms.forEach(a => db.run('INSERT INTO atms (id, location) VALUES (?, ?)', [a.id, a.location]));
    accounts.forEach(a => db.run('INSERT INTO accounts (id, customer_id, branch_id, product_name, balance) VALUES (?, ?, ?, ?, ?)', [a.id, a.customer_id, a.branch_id, a.product, a.balance]));
    transactions.forEach(t => db.run('INSERT INTO transactions (account_id, date, amount, type, channel, atm_id) VALUES (?, ?, ?, ?, ?, ?)', [t.account_id, t.date, t.amount, t.type, t.channel, t.atm_id]));
    loans.forEach(l => db.run('INSERT INTO loans (id, customer_id, loan_product, principal_amount, interest_rate, origination_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [l.id, l.customer_id, l.loan_product, l.principal_amount, l.interest_rate, l.origination_date, l.status]));
    digital_logs.forEach(d => db.run('INSERT INTO digital_logs (customer_id, date, activity_type, amount) VALUES (?, ?, ? ,?)', [d.customer_id, d.date, d.type, d.amount]));
    
    console.log('Larger sample banking data has been inserted into source.db.');
});

db.close();