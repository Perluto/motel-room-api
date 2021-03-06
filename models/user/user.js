const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
    },
    idRoleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isConfirm: {
      type: Boolean,
      default: false,
      required: true,
    },
  })
);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(6).required().label("Username"),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .required()
      .label("Password"),
    idRoleRef: Joi.objectId().required(),
    isConfirm: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
