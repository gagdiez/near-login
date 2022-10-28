const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

// Authentication
const walletAuthenticate = require('./authenticate/passport-strategy')
const passport = require('passport');

// Handling website
const nunjucks = require('nunjucks')  // View Engine
const web_routes = require('./routes/index');  // Handle base page
const user_routes = require('./routes/user');  // Handle register/login

// Create app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', { autoescape: true, express: app });
app.set('view engine', 'html');

// app config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session + auth
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Configure passport to use the passport_local_near functions
passport.use('near', new walletAuthenticate.Strategy())
passport.serializeUser(walletAuthenticate.serializeUser())
passport.deserializeUser(walletAuthenticate.deserializeUser())

// to pass messages across routes
app.use(flash());

// Add public folder to separate js and css of the web
app.use(express.static(path.join(__dirname, 'public')));

// handle routes in another file
app.use('/user/', user_routes);
app.use('/', web_routes);

// catch 404 and forward to error handler
function error404(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

function error_handler(err, req, res, next) {
  res.status(err.status || 500);

  error = {}; // By default, we do not leak info to users

  if (app.get('env') === 'development') {
    error = err; // In development we see the stack
  }

  res.render('error', { message: err.message, error: error });
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