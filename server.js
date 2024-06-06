const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: "timekeeper_user",
  host: "localhost",
  database: "timekeeper",
  password: "password",
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

// Create tables
pool.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    organization VARCHAR(100)
  );
  CREATE TABLE IF NOT EXISTS hours (
    id SERIAL PRIMARY KEY,
    userId INTEGER,
    hours INTEGER,
    date TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  );
`,
  (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Tables created or already exist");
    }
  }
);

// API to add a user
app.post("/users", (req, res) => {
  const { name, organization } = req.body;
  pool.query(
    "INSERT INTO users (name, organization) VALUES ($1, $2) RETURNING id",
    [name, organization],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ id: results.rows[0].id });
    }
  );
});

// API to log hours for a user
app.post("/hours", (req, res) => {
  const { userId, hours, date } = req.body;
  pool.query(
    "INSERT INTO hours (userId, hours, date) VALUES ($1, $2, $3) RETURNING id",
    [userId, hours, date],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ id: results.rows[0].id });
    }
  );
});

// API to get users by organization
app.get("/users/:organization", (req, res) => {
  const { organization } = req.params;
  pool.query(
    "SELECT * FROM users WHERE organization = $1",
    [organization],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
});

// API to get hours for a user
app.get("/hours/:userId", (req, res) => {
  const { userId } = req.params;
  pool.query(
    "SELECT * FROM hours WHERE userId = $1",
    [userId],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
