const mongoose = require("mongoose");

const capplicantSchema = {
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
};

module.exports = mongoose.model("Capplicant", capplicantSchema);
