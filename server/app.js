const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const passport = require('passport');
const passportJWT = require('passport-jwt');

// Authentication
const near = require('./authenticate/passport-strategy')

// Create app
var app = express();

// app config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS - Trust me, you do NOT want to use '*' in production
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Configure passport to use the passport_local_near functions
passport.use('near', new near.Strategy())
passport.serializeUser(near.serializeUser)
passport.deserializeUser(near.deserializeUser)

passport.use('jwt',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'a-fixed-secret-is-not-secure',
    },
    (payload, callback) => {
      if (payload && payload.expires > Date.now()) return callback(null, payload.accountId);
      return callback(null, false);
    })
);

// Auth
app.use(passport.initialize());

// handle routes in another file
const index_routes = require('./routes.js');
app.use('/', index_routes);

// catch 404 and forward to error handler
function error404(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

function error_handler(err, req, res, next) {
  res.status(err.status || 500);

  let error = {}; // By default, we do not leak info to users

  if (app.get('env') === 'development') {
    error = err; // In development we see the stack
  }

  res.json({ message: err.message, error: error });
}

app.use(error404);
app.use(error_handler);

// Start server
var port = process.env.PORT || '3000';
var ip = process.env.IP || 'localhost';

function onListen() {
  console.log("Listening on PORT: " + port + " at IP: " + ip);
}

app.listen(port, ip, onListen);