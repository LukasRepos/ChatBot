const mongoose = require('mongoose');

module.exports = {
     run: async function () {
          await mongoose.connect(process.env.MONGODB_URI, {
               useNewUrlParser: true,
               useUnifiedTopology: true
          });
          console.log("Connected to the DB");
     }
}