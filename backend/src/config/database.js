const mongoose = require('mongoose');
const dbURL = process.env.MONGO_URI;

async function connectedToDB() {
  try{
    await mongoose.connect(dbURL);
    console.log("connected to database");
  } catch( err ){
    console.log(err);
  }
}

module.exports = connectedToDB