const sqlite3 = require('sqlite3').verbose();

const sourceDB = new sqlite3.Database('./source.db');
const destDB = new sqlite3.Database('./destination.db');

const runQuery = (db, sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
const runStatement = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function(err) { err ? reject(err) : resolve(this); }));

const getDateKey = (dateStr) => {
    if (!dateStr) return null;
    return parseInt(dateStr.replace(/-/g, ''));
};

async function etlProcess() {
    try {
        console.log('--- Starting Banking ETL Process ---');


        console.log('Phase 1: Extracting data...');
        const [customers, accounts, transactions, loans, digital_logs, branches, atms] = await Promise.all([
            runQuery(sourceDB, 'SELECT * FROM customers'), runQuery(sourceDB, 'SELECT * FROM accounts'),
            runQuery(sourceDB, 'SELECT * FROM transactions'), runQuery(sourceDB, 'SELECT * FROM loans'),
            runQuery(sourceDB, 'SELECT * FROM digital_logs'), runQuery(sourceDB, 'SELECT * FROM branches'),
            runQuery(sourceDB, 'SELECT * FROM atms')
        ]);
        const accountMap = new Map(accounts.map(a => [a.id, a]));

        console.log('Transforming and Loading data');

        console.log('Clearing destination tables...');
        const tables = ['Fact_Transaction', 'Fact_Loan', 'Fact_Deposit', 'Fact_Account_Balance', 'Fact_ATM_Usage', 'Fact_Internet_Banking', 'Dim_Nasabah', 'Dim_Waktu', 'Dim_Rekening', 'Dim_Cabang', 'Dim_ATM', 'Dim_Kanal', 'Dim_Produk_Deposito'];
        for (const table of tables) {
            await runStatement(destDB, `DELETE FROM ${table}`);
        }

        console.log('Loading Dimensions...');
        for (const c of customers) await runStatement(destDB, 'INSERT INTO Dim_Nasabah (customer_key, full_name) VALUES (?, ?)', [c.id, c.full_name]);
        for (const a of accounts) await runStatement(destDB, 'INSERT INTO Dim_Rekening (account_key) VALUES (?)', [a.id]);
        for (const b of branches) await runStatement(destDB, 'INSERT INTO Dim_Cabang (branch_key, branch_name) VALUES (?, ?)', [b.id, b.branch_name]);
        for (const a of atms) await runStatement(destDB, 'INSERT INTO Dim_ATM (atm_key, location) VALUES (?, ?)', [a.id, a.location]);

        const allDates = [...new Set([...transactions.map(t => t.date), ...loans.map(l => l.origination_date), ...digital_logs.map(d => d.date)].filter(Boolean))];
        for (const d_str of allDates) {
            const dateKey = getDateKey(d_str);
            if (dateKey) {
                const d = new Date(d_str);
                await runStatement(destDB, 'INSERT INTO Dim_Waktu (date_key, full_date, year, month) VALUES (?, ?, ?, ?)', [dateKey, d_str, d.getFullYear(), d.getMonth() + 1]);
            }
        }

        console.log('Loading Fact Tables...');
        for (const t of transactions) await runStatement(destDB, 'INSERT INTO Fact_Transaction (transaction_key, date_key, customer_key, account_key, amount) VALUES (?, ?, ?, ?, ?)', [t.id, getDateKey(t.date), accountMap.get(t.account_id).customer_id, t.account_id, t.amount]);
        for (const l of loans) await runStatement(destDB, 'INSERT INTO Fact_Loan (loan_key, origination_date_key, customer_key, jumlah_pinjaman) VALUES (?, ?, ?, ?)', [l.id, getDateKey(l.origination_date), l.customer_id, l.principal_amount]);

        const snapshotDateKey = getDateKey('2025-10-31');
        for (const a of accounts) {
            await runStatement(destDB, 'INSERT INTO Fact_Deposit (deposit_key, date_key, customer_key, saldo_deposito) VALUES (?, ?, ?, ?)', [a.id, snapshotDateKey, a.customer_id, a.balance]);
            await runStatement(destDB, 'INSERT INTO Fact_Account_Balance (balance_key, date_key, account_key, saldo_harian) VALUES (?, ?, ?, ?)', [a.id, snapshotDateKey, a.id, a.balance]);
        }

        const atmTransactions = transactions.filter(t => t.channel === 'ATM');
        for (const t of atmTransactions) await runStatement(destDB, 'INSERT INTO Fact_ATM_Usage (atm_usage_key, date_key, customer_key, atm_key, jumlah_transaksi_atm, total_uang_ditarik) VALUES (?, ?, ?, ?, ?, ?)', [t.id, getDateKey(t.date), accountMap.get(t.account_id).customer_id, t.atm_id, 1, Math.abs(t.amount)]);

        const digitalSummary = {};
        digital_logs.forEach(log => {
            const key = `${log.customer_id}_${log.date}`;
            if (!digitalSummary[key]) digitalSummary[key] = { customer_id: log.customer_id, date: log.date, logins: 0, transfers: 0 };
            if (log.activity_type === 'LOGIN') digitalSummary[key].logins++;
            if (log.activity_type === 'TRANSFER') digitalSummary[key].transfers++;
        });
        for (const key in digitalSummary) {
            const summary = digitalSummary[key];
            await runStatement(destDB, 'INSERT INTO Fact_Internet_Banking (date_key, customer_key, jumlah_login, jumlah_transfer_online) VALUES (?, ?, ?, ?)', [getDateKey(summary.date), summary.customer_id, summary.logins, summary.transfers]);
        }

        console.log('--- Banking ETL Process Completed Successfully ---');
    } catch (err) {
        console.error('ETL process failed:', err);
    } finally {
        sourceDB.close();
        destDB.close();
        console.log('All database connections closed.');
    }
}

etlProcess();