require( 'dotenv' ).config()
const session = require('express-session');
const flash = require('connect-flash');
const msal = require("@azure/msal-node");

const cors = require( `cors` )
const express = require( "express" )

const outlookAuthRouter = require('./routes/outlook-auth');
const indexRouter = require( './routes/index' )
const authRouter = require( `./routes/auth` )
const userRouter = require( "./routes/usuarios" )

const PreferenciaController = require( `./controllers/PreferenciaController` )


const app = express()
app.use( cors() )
app.use( express.json() )
app.set('trust proxy', true)

// Session middleware
// NOTE: Uses default in-memory session store, which is not
// suitable for production
app.use(session({
  secret: 'your_secret_value_here',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Flash middleware
app.use(flash());

// Set up local vars for template layout
app.use(function(req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.error = req.flash('error_msg');

  // Check for simple error string and
  // convert to layout's expected format
  var errs = req.flash('error');
  for (var i in errs){
    res.locals.error.push({message: 'An error occurred', debug: errs[i]});
  }

  // Check for an authenticated user and load
  // into response locals
  if (req.session.userId) {
    res.locals.user = app.locals.users[req.session.userId];
  }

  next();
});

// In memory storage ot logged in users 
app.locals.users = {};

// MSAL config
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};

// Create msal application object
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);

app.set('view engine', 'hbs');

//const mongoose = require( 'mongoose' )

//mongoose.connect( process.env.DATABASE_URL, { useNewUrlParser: true } )
//const db = mongoose.connection
//db.on( 'error', error => console.error( error ) )
//db.once( 'open', () => console.log( `Connected to database.` ) )

app.use( express.static( 'public' ) )
app.use( express.urlencoded( { encoded: true } ) )
app.use( express.json() )

app.use( "/usuarios", userRouter )
app.use( "/outlook-auth", outlookAuthRouter )
app.use( `/auth`, authRouter )
app.use( `/preferencias`, PreferenciaController )
app.use( '/', indexRouter )

app.listen( 5000, () => console.info( `West Telco Backend Started` ) )