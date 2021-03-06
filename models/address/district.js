const mongoose = require("mongoose");

const District = mongoose.model(
  "District",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    idCityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
  })
);

module.exports = District;
