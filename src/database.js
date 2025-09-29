const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.db");
const db = new sqlite3.Database(dbPath);

// Criar tabelas
db.serialize(() => {
  // Tabela de sites
  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      check_time INTEGER NOT NULL,
      webhook_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active BOOLEAN DEFAULT 1
    )
  `);

  // Tabela de checks
  db.run(`
    CREATE TABLE IF NOT EXISTS site_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      check_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      response_time REAL,
      status_code INTEGER,
      error_message TEXT,
      response_headers TEXT,
      response_body TEXT,
      success BOOLEAN,
      FOREIGN KEY (site_id) REFERENCES sites (id)
    )
  `);

  console.log("✅ Tabelas criadas com sucesso!");
});

// Promisify para usar async/await
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
