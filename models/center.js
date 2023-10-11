const mongoose = require("mongoose");

const centerSchema = {
  fullname: String,
  address: String,
  phno: Number,
  email: String,
  type: String,
  caddress: String,
  cdistrict: String,
  cpanchayath: String,
  cpincode: Number,
  buildingno: Number,
  photos: [
    {
      type: String,
    },
  ],
  shortId2: String,
};

module.exports = mongoose.model("Center", centerSchema);
