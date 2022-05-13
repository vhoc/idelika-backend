require( 'dotenv' ).config()

const express = require( "express" )
const outlookAuthRouter = require('./routes/outlook-auth');

const app = express()

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

const mongoose = require( 'mongoose' )
const userRouter = require( "./routes/usuarios" )

mongoose.connect( process.env.DATABASE_URL, { useNewUrlParser: true } )
const db = mongoose.connection
db.on( 'error', error => console.error( error ) )
db.once( 'open', () => console.log( `Connected to database.` ) )

app.use( express.static( 'public' ) )
app.use( express.urlencoded( { encoded: true } ) )
app.use( express.json() )

app.use( "/usuarios", userRouter )
app.use( "/outlook-auth", outlookAuthRouter )

app.listen( 3000, () => console.info( `West Telco Backend Started` ) )