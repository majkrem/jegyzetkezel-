const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(process.cwd(), "data", "app.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "server", "db", "schema.sql");

// Biztosítsuk, hogy a data mappa létezzen
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Kapcsolódás a DB-hez (a fájl automatikusan létrejön, ha nincs)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ SQLite kapcsolódási hiba:", err.message);
  } else {
    console.log("✅ SQLite DB megnyitva:", DB_PATH);
  }
});

// Hasznos: foreign key-k alapból OFF lehetnek SQLite-ban, ezért bekapcsoljuk
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

/**
 * Inicializálja az adatbázist a schema.sql alapján.
 * Egyszer lefuttatva létrehozza a táblákat és indexeket.
 */
function initDb() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf-8");

  db.exec(schemaSql, (err) => {
    if (err) {
      console.error("❌ Schema futtatási hiba:", err.message);
      return;
    }
    console.log("✅ DB séma kész (users, notes)");
  });
}

module.exports = { db, initDb };
