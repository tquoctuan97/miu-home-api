const users = require("express").Router();
const userController = require("../controllers/userController")

users.get("/:userId", userController.getUserInfoById)

module.exports = users