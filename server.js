const express = require('express');
// const bcrypt = require('bcrypt')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./Controllers/register');
const signin = require('./Controllers/signin');

// Initialize Knex with PostgreSQL connection details
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '2002',
    database: 'face-recognize',
  }
});

const app = express();

app.use(express.json()); // Middleware for parsing JSON bodies
app.use(cors());

// Corrected route to use the defined 'db' variable
app.get('/', (req, res) => {
  db.select('*').from('users') // Replace 'database.user' with 'db.select...'
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(400).json('Unable to fetch users'));
});

app.post('/signin', (req, res) => { signin.handlesignin(req, res, db, bcrypt); });

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt); });

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found!');
      }
    })
    .catch(err => res.status(400).json('Bad request'));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('Unable to request'));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
