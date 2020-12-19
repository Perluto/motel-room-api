const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const DB = require("../startup/db");
const db = new DB();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { User, validateUser } = require("../models/user/user");
const Role = require("../models/user/role");
const { UserInfo, validateUserInfo } = require("../models/user/userInfo");

const auth = require("../middleware/auth");
const isOwner = require("../middleware/owner");
const isAdmin = require("../middleware/admin");

router.get("/owner", [auth], async (req, res) => {
  db.connect();

  const users = await User.find({ isOwner: true, isAdmin: false }).select(
    "-password"
  );

  db.disconnect();

  res.send(users);
});

router.get("/owner/:id", [auth, isOwner], async (req, res) => {
  db.connect();

  const user = await User.findById(req.params.id);
  if (!user) res.status(400).send("Invalid id.");

  const userInfo = await UserInfo.find({
    idUserRef: new ObjectId(req.params.id),
  });

  if (!userInfo) res.status(400).send("Invalid id.");
  db.disconnect();

  res.send(userInfo);
});

router.post("/", async (req, res) => {
  db.connect();

  let user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    username: req.body.username,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  if (!req.body.isOwner) {
    const role = await Role.find({ isOwner: false, isAdmin: false });
    if (!role) return res.status(404).send("Error");

    const { error } = validateUser({
      username: req.body.username,
      password: req.body.password,
      idRoleRef: role._id,
    });

    if (error) return res.status(400).send(error.details[0].message);

    user.idRoleRef = new ObjectId(role._id);
    user.idConfirm = true;
    user
      .save()
      .then(() => {
        res.send("done");
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  } else {
    const role = await Role.find({ isOwner: true, isAdmin: false });
    if (!role) return res.status(404).send("Error");

    const { error } = validateUser({
      username: req.body.username,
      password: req.body.password,
      idRoleRef: role._id,
    });
    if (error) return res.status(400).send(error.details[0].message);

    user.idRoleRef = new ObjectId(role._id);

    user
      .save()
      .then((result) => {
        const { error } = validateUserInfo({
          idUserRef: result._id,
          name: req.body.name,
          cardId: req.body.cardId,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
        });
        if (error) return res.status(400).send(error.details[0].message);

        let userInfo = new UserInfo({
          idUserRef: new ObjectId(result._id),
          name: req.body.name,
          cardId: req.body.cardId,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
        });

        return userInfo.save();
      })
      .then((result) => {
        res.send("Done");
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
});

router.put("/owner/:id/status", [auth, isAdmin], async (req, res) => {
  db.connect();

  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("Invalid id.");

  const salt = await bcrypt.genSalt(10);
  let newPassword = await bcrypt.hash(req.body.password, salt);
  const newUser = await Report.findByIdAndUpdate(
    req.params.id,
    { password: newPassword },
    { new: true }
  );

  if (!newUser)
    return res.status(404).send("The user with the given ID was not found.");

  db.disconnect();
  res.send(newUser);
});

router.put("/owner/:idUser/profile", [auth, isOwner], async (req, res) => {
  const data = req.body.data;
  data.idUserRef = req.params.idUser;
  const { error } = validateUserInfo(data);
  if (error) return res.status(400).send(error.details[0].message);

  db.connect();
  const userInfo = await UserInfo.find({
    inUserRef: new ObjectId(req.params.idUser),
  });
  if (!userInfo) return res.status(400).send("Invalid id.");

  const newUser = await UserInfo.findByIdAndUpdate(
    userInfo._id,
    {
      name: data.name,
      cardId: data.cardId,
      email: data.email,
      phone: data.phone,
      address: data.address,
    },
    { new: true }
  );

  if (!newUser)
    return res.status(404).send("The report with the given ID was not found.");

  db.disconnect();
  res.send(newUser);
});

router.put("/:id/change-password", [auth], async (req, res) => {
  db.connect();

  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("Invalid id.");

  const newUser = await User.findByIdAndUpdate(
    userInfo._id,
    {
      name: req.body.name,
      cardId: req.body.cardId,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    },
    { new: true }
  );

  if (!newUser)
    return res.status(404).send("The report with the given ID was not found.");

  db.disconnect();
  res.send(newUser);
  db.disconnect();
});

module.exports = router;
