const mongoose = require("mongoose");

const RoomType = mongoose.model(
  new mongoose.Schema({
    name: {
      type: String,
      require: true,
    },
  })
);

module.exports = RoomType;