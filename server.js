
// Importing packages needed
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

// Importing database and needed security files
import database from './config/config.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import { applySecurity } from './middleware/securityMiddleware.js';

// importing routes
import userRoutes from "./routes/userRoutes.js"
import donationRoutes from "./routes/donationRoutes.js"
import paystackRoutes from './routes/paystackRoutes.js'
import projectRoutes from './routes/projectRoutes.js'

config();
const app = express();

// Connect to database
await database();

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// applySecurity(app);

// Middleware for parsing cookies
app.use(cookieParser());

// Handling routes
app.use('/api/users', userRoutes)
app.use('/api/donations', donationRoutes)
app.use("/api/paystack", paystackRoutes)
app.use('/api/projects', projectRoutes)

// Setting ejs templating engine
app.set(
  'view engine',
  'ejs'
)

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);
