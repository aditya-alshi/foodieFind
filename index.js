const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
const port = 3000;

const initDatabase = (req, res, next) => {
  const db = new sqlite3.Database('/tmp/database.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
  
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        cuisine TEXT,
        isVeg TEXT,
        rating REAL,
        priceForTwo INTEGER,
        location TEXT,
        hasOutdoorSeating TEXT,
        isLuxury TEXT
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('Restaurants table created or already exists.');
        }
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        isVeg TEXT,
        rating REAL,
        price INTEGER
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('Dishes table created or already exists.');
        }
      }
    );
  
    const stmt = db.prepare(
      'INSERT INTO restaurants (name, cuisine, isVeg, rating, priceForTwo, location, hasOutdoorSeating, isLuxury) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const stmt2 = db.prepare(
      'INSERT INTO dishes (name, isVeg, rating, price) VALUES (?, ?, ?, ?)'
    );
  
    const restaurants = [
      {
        name: 'Spice Kitchen',
        cuisine: 'Indian',
        isVeg: 'true',
        rating: 4.5,
        priceForTwo: 1500,
        location: 'MG Road',
        hasOutdoorSeating: 'true',
        isLuxury: 'false',
      },
      {
        name: 'Olive Bistro',
        cuisine: 'Italian',
        isVeg: 'false',
        rating: 4.2,
        priceForTwo: 2000,
        location: 'Jubilee Hills',
        hasOutdoorSeating: 'false',
        isLuxury: 'true',
      },
      {
        name: 'Green Leaf',
        cuisine: 'Chinese',
        isVeg: 'true',
        rating: 4.0,
        priceForTwo: 1000,
        location: 'Banjara Hills',
        hasOutdoorSeating: 'false',
        isLuxury: 'false',
      },
    ];
    const dishes = [
      {
        name: 'Paneer Butter Masala',
        price: 300,
        rating: 4.5,
        isVeg: 'true',
      },
      {
        name: 'Chicken Alfredo Pasta',
        price: 500,
        rating: 4.7,
        isVeg: 'false',
      },
      {
        name: 'Veg Hakka Noodles',
        price: 250,
        rating: 4.3,
        isVeg: 'true',
      },
    ];
  
    for (let restaurant of restaurants) {
      stmt.run(
        restaurant.name,
        restaurant.cuisine,
        restaurant.isVeg,
        restaurant.rating,
        restaurant.priceForTwo,
        restaurant.location,
        restaurant.hasOutdoorSeating,
        restaurant.isLuxury
      );
    }
    for (let dish of dishes) {
      stmt2.run(dish.name, dish.isVeg, dish.rating, dish.price);
    }
  
    stmt.finalize();
    stmt2.finalize();
  
    console.log('Inserted 3 restaurants into the database.');
    console.log('Inserted 3 dishes into the database.');
  
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
};

app.use(initDatabase);

app.use(cors());

app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: '/tmp/database.db',
    driver: sqlite3.Database,
  });
})();

app.get('/', (req, res) => {
  res.send('FoodieFinds Assignment_1');
});

// restaurants apis functions
async function getAllRestaurants(req, res) {
  let query = 'SELECT * FROM restaurants';

  try {
    let restaurants = await db.all(query, []);

    if (restaurants.length === 0) {
      res.status(404).json({ restaurants: 'Restaurants NOT FOUND' });
      return;
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getRestaurantById(req, res) {
  let id = req.params.id;
  let query = 'SELECT * FROM restaurants WHERE id == ?';

  try {
    let restaurants = await db.all(query, [id]);

    if (restaurants.length === 0) {
      res
        .status(404)
        .json({ restaurants: 'Restaurants of ' + id + ' ID, NOT FOUND' });
      return;
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getRestaurantsByCuisine(req, res) {
  let cuisine = req.params.cuisine;
  let query = 'SELECT * FROM restaurants WHERE cuisine = ?';

  try {
    let restaurants = await db.all(query, [cuisine]);

    if (restaurants.length === 0) {
      res.status(404).json({
        restaurants: 'Restaurants of ' + cuisine + ' Cuisine, Not Found',
      });
      return;
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRestaurantsByIsVeg_HasOutdoorSeating_IsLuxury(req, res) {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;

  let query =
    'SELECT * FROM restaurants WHERE isVeg == ? AND hasOutdoorSeating == ? AND isLuxury == ?';

  try {
    let restaurants = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);

    if (restaurants.length === 0) {
      res.status(404).json({ restaurants: 'Restaurants, NOT FOUND' });
      return;
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRestaurantsOrderedByRating(req, res) {
  let query = 'SELECT * FROM restaurants ORDER BY rating DESC';

  try {
    let restaurants = await db.all(query, []);

    if (restaurants.length === 0) {
      res.status(404).json({ restaurants: 'Restaurants, NOT FOUND' });
      return;
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// dishes apis functions
async function getAllDishes(req, res) {
  let query = 'SELECT * FROM dishes';

  try {
    let dishes = await db.all(query, []);

    if (dishes.length === 0) {
      res.status(404).json({ dishes: 'Dishes Not Found' });
      return;
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getDishesById(req, res) {
  let id = req.params.id;
  let query = 'SELECT * FROM dishes WHERE id == ?';

  try {
    let dishes = await db.all(query, [id]);

    if (dishes.length === 0) {
      res.status(404).json({ dishes: 'Dishes of ' + id + ' ID, Not Found' });
      return;
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getDishesByisVeg(req, res) {
  let isVeg = req.query.isVeg;
  let query = 'SELECT * FROM dishes WHERE isVEg == ?';

  try {
    let dishes = await db.all(query, [isVeg]);

    if (dishes.length === 0) {
      res.status(404).json({ dishes: 'Dishes, NOT FOUND' });
      return;
    }
    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getDishesOrderedByPrice(req, res) {
  let query = 'SELECT * FROM dishes ORDER BY price';

  try {
    let dishes = await db.all(query, []);

    if (dishes.length === 0) {
      res.status(404).json({ dishes: 'Dishes, Not Found' });
      return;
    }
    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// restaurants apis
app.get('/restaurants', getAllRestaurants);
app.get('/restaurants/details/:id', getRestaurantById);
app.get('/restaurants/cuisine/:cuisine', getRestaurantsByCuisine);
app.get(
  '/restaurants/filter',
  getRestaurantsByIsVeg_HasOutdoorSeating_IsLuxury
);
app.get('/restaurants/sort-by-rating', getRestaurantsOrderedByRating);

// dishes apis
app.get('/dishes', getAllDishes);
app.get('/dishes/details/:id', getDishesById);
app.get('/dishes/filter', getDishesByisVeg);
app.get('/dishes/sort-by-price', getDishesOrderedByPrice);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
