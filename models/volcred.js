const mongoose = require("mongoose");

const volcredSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be blank"],
  },
  volid: {
    type: String,
    required: [true, "Volunteer ID cannot be blank"],
  },
});

module.exports = mongoose.model("Volcred", volcredSchema);
