const auth = require("express").Router();
const userController = require("../controllers/userController")

auth.post("/register", userController.apiRegister)
auth.post("/login", userController.apiLogin)

auth.post("/doesUsernameExist", userController.doesUsernameExist)
auth.post("/doesEmailExist", userController.doesEmailExist)

module.exports = auth
