const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
const port = 3000;

// Initialize the database once on server start
let db;
(async () => {
  db = await open({
    filename: '/tmp/database.db',
    driver: sqlite3.Database,
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      cuisine TEXT,
      isVeg TEXT,
      rating REAL,
      priceForTwo INTEGER,
      location TEXT,
      hasOutdoorSeating TEXT,
      isLuxury TEXT
    );
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      isVeg TEXT,
      rating REAL,
      price INTEGER
    );
  `);
  console.log('Database initialized and tables created.');
})();

// Middleware to attach the db to req
const attachDatabase = (req, res, next) => {
  req.db = db;
  next();
};

app.use(attachDatabase);
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FoodieFinds Assignment_1');
});

// Define routes as before, now using req.db for database queries
