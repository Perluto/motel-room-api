const mongoose = require("mongoose");
const Joi = require("joi");

const Address = mongoose.model(
  "Address",
  new mongoose.Schema({
    number: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    idWardRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
    },
    idDistrictRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    idCityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
  })
);

function validateAddress(address) {
  const schema = Joi.object({
    number: Joi.string().required(),
    street: Joi.string().required(),
    idWardRef: Joi.objectId().required(),
    idDistrictRef: Joi.objectId().required(),
    idCityRef: Joi.objectId().required(),
  });

  return schema.validate(address);
}

exports.Address = Address;
exports.validateAddress = validateAddress;
