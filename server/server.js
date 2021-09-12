'use strict';
const http = require('http');
const path = require('path');
if (process.env.NODE_ENV === 'development') require('dotenv').config();
require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jsonValidator = require('./middleware/jsonValidator');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');

const { setOnline, emptyOfflineQueue } = require('./utils/agentAvailability');

let allowedOrigins = [
  'http://localhost:3000',
  'https://shftr.fyi',
  'https://accounts.google.com',
  'http://localhost:5000',
  'https://shftr-api.herokuapp.com',
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions = { credentials: true };
  if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
    corsOptions.origin = true;
  } else {
    corsOptions.origin = false;
  }

  callback(null, corsOptions);
};

let server;
const app = express();

mongoose.Promise = global.Promise;
// mongoose.set('debug', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

app.use(morgan('dev'));
app.use(express.json());
// app.use(cors());
app.use(cors(corsOptionsDelegate));
app.use(cookieParser());
app.use(jsonValidator);

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.use(express.static('./public'));

// require('./config/passport')(passport);
require('./routes/api/auth.route')(app);
require('./routes/api/zendesk.route')(app);
require('./routes/api/agents.route')(app);
require('./routes/api/appointments.route')(app);
require('./routes/api/history.route')(app);
require('./routes/api/keys.route')(app);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// const whatTime = () => {
//   console.log(new Date());
// };

// cron.schedule('*/15 * * * *', whatTime);
cron.schedule('*/15 * * * *', () => {
  setOnline();
  emptyOfflineQueue();
});

function keepAwake() {
  console.log('No sleep for you!');
  http.get('http://shftr-api.herokuapp.com/');
}

if (process.env.NODE_ENV !== 'development') {
  cron.schedule('*/30 * * * *', keepAwake);
}

function runServer() {
  const port = process.env.PORT || 5000;
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DATABASE_URI, err => {
      if (err) {
        console.log(process.env.DATABASE_URI);
        return reject(err);
      }
      server = app
        .listen(port, () => {
          // console.log('\n', `🏆  Your app is now running on port ${port} 🚀`, '\n');
          console.log('\n', `Your app is now running on port ${port}`, '\n');
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
