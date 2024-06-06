const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

//initialize sqlite3 database
const db = new sqlite3.Database(":memory:");

//create table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, organization TEXT, userID INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS hours (id INTEGER PRIMARY KEY, userid INTEGER, date TEXT, hours INTEGER, FOREIGN KEY(userid) REFERENCES users(id))");
});

//API to add a user
app.post('/users', (req, res) => {
    
    const { name, organization } = req.body;
    db.run("INSERT INTO users (name, organization) VALUES (?, ?)", [name, organization], function(err) {
        if (err) {
            return res.status(400).json({error:err.message})
    }
        res.json({
            id: this.lastID,
            name,
            organization
        });
    });
});

//API to log hours for a user
app.post('/hours', (req, res) => {
    const { userid, date, hours } = req.body;
    db.run("INSERT INTO hours (userid, date, hours) VALUES (?, ?, ?)", [userid, date, hours], function(err) {
        if (err) {
            return res.status(400).json({error:err.message})
    }
        res.json({
            id: this.lastID,
            userid,
            date,
            hours
        });
    });
});

//API to get users by organization
app.get('/users/:organization', (req, res) => {
    const organization = req.params.organization;
    db.all("SELECT * FROM users WHERE organization = ?", [organization], (err, rows) => {
        if (err) {
            return res.status(400).json({error:err.message})
        }
        res.json(rows);
    });
});

//API to get hours for a user
app.get('/hours/:userid', (req, res) => {
    const userid = req.params.userid;
    db.all("SELECT * FROM hours WHERE userid = ?", [userid], (err, rows) => {
        if (err) {
            return res.status(400).json({error:err.message})
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});