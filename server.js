import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import database from './config/config.js';
import { config } from 'dotenv';
config();
const app = express();
app.set(
  'view engine',
  'ejs'
)
// Connect to database
await database();

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);
