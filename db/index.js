const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DBNAME}`
    );
    console.log(`DataBase Connected Succesfully `);
  } catch (error) {
    throw error
  }
};

module.exports = connectDb;
