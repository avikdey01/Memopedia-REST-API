const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/User");

//Register Route
router.post("/register", async (req, res) => {
  try {
    //generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err);
  }
});

//Login Route
router.post("/login", async (req, res)=> {
  try {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
      res.status(404).json("User not found!");
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) {
      res.status(400).json("Invalid Password");
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err);
  }
});

module.exports = router;
