const mongoose = require("mongoose");

const reportSchema = {
  title: String,
  description: String,
  date: String,
  category: String,
  hours: Number,
  center: String,
  volunteer: String,
};

module.exports = mongoose.model("Report", reportSchema);
