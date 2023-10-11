const mongoose = require("mongoose");

const applicantSchema = {
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
};

module.exports = mongoose.model("Applicant", applicantSchema);
