const dotenv = require('dotenv');
const mongoose = require('mongoose');

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('FROM uncaught exception: ', err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL || process.env.DOCKER_MONGO_URI;
console.log(DB);

const app = require('./app');

// DATABASE CONNECTION
mongoose.connect(DB, {}).then((con) => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

// handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('FROM unhandledRejection: ', err);
  server.close(() => process.exit(1));
});
