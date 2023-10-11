const mongoose = require("mongoose");

const volunteerSchema = {
  firstname: String,
  lastname: String,
  age: Number,
  dobFormatted: String,
  gender: String,
  aadhar: Number,
  phno: Number,
  address: String,
  dayPreference: String,
  categories: String,
  email: String,
  center: String,
  image: String,
  shortId: String,
};

module.exports = mongoose.model("Volunteer", volunteerSchema);
