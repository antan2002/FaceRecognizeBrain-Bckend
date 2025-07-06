const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

// Declare app first
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Controllers
const register = require('./Controllers/register');
const signin = require('./Controllers/signin');

// Database
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

// Clarifai route - must come AFTER app is defined
const PAT = '096813c7f4874a5d919d91c3acd560e6';
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'celebrity-face-detection';
const MODEL_VERSION_ID = '2ba4d0b0e53043f38dbbed49e03917b6';

app.post('/clarifai', async (req, res) => {
  const fetch = (await import('node-fetch')).default;

  const { imageUrl } = req.body;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: imageUrl,
          },
        },
      },
    ],
  });

  try {
    const response = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Key ${PAT}`,
          'Content-Type': 'application/json',
        },
        body: raw,
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Clarifai API error:', error);
    res.status(500).json({ error: 'Failed to fetch from Clarifai API' });
  }
});

// Other routes (register, signin, etc.)
app.post('/signin', (req, res) => signin.handlesignin(req, res, db, bcrypt));
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id })
    .then(user => user.length ? res.json(user[0]) : res.status(400).json('Not found!'))
    .catch(err => res.status(400).json('Bad request'));
});
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to update entries'));
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
