const dotenv = require('dotenv');
const mongoose = require('mongoose');
//if we declare this in a file then it can be accessed by all files
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(con => {
    // console.log(con);
    console.log('Mongoose connection successful');
  });

const app = require('./app.js');

// console.log(process.env);

//create a server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
