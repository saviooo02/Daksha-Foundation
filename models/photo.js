const mongoose = require("mongoose");

const photoSchema = {
  filename: String,
};

// const photoSchema = new Schema({
//   filename: String,
//   // Add any additional fields you need for the photo
// });

module.exports = mongoose.model("Photo", photoSchema);
