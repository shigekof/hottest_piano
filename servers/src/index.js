// Ensure environment variables are loaded before other modules are evaluated.
// Importing the dotenv config as a side-effect guarantees process.env is populated
// for any modules that are imported (ES modules are evaluated before top-level code).
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import checkSubscriberRoute from './routes/checkSubscriber.js';

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/', checkSubscriberRoute);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
