const mongoose = require("mongoose");

const connectDB = async () => {
  const connection = await mongoose.connect(
    process.env.MONGO_URI ? process.env.MONGO_URI : process.env.LOCAL_MONGO_URI);

  console.log(
    `Mongodb connected: ${connection.connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
