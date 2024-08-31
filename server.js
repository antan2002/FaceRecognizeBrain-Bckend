const express = require('express');
// const bcrypt = require('bcrypt')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors')
const knex = require('knex');

const register = require('./Controllers/register')
const signin = require('./Controllers/signin')
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

app.use(express.json())//using middleware
app.use(cors());

app.get('/', (req, res) => {
  res.send(database.user);
})

app.post('/signin', (req, res) => { signin.handlesignin(req, res, db, bcrypt) })


app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })



app.get('/profile/:id', (req, res) => {
  const { id } = req.params; // const id = req.params.id
  db.select('*').from('users').where({ id })
    .then(user => {
      console.log(user)
      if (user.length >= 1) {
        res.json(user[0])
      } else {
        res.status(400).json('not found!')
      }
    })
    .catch(err => res.status(400).json('bad request'))
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('umable to request'))
})
app.listen(3000, () => {
  console.log("it's working")
})