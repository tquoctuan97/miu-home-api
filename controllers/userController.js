const User = require("../models/User")
const Post = require("../models/Post")
const Follow = require("../models/Follow")
const jwt = require("jsonwebtoken")
const { errorHandler, responseHandler } = require("../helpers/response")

// how long a token lasts before expiring
const tokenLasts = "365d"

exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
    next()
  } catch (e) {
    res.status(500).send("Sorry, you must provide a valid token.")
  }
}

exports.doesUsernameExist = function (req, res) {
  User.findByUsername(req.body.username.toLowerCase())
    .then(function () {
      res.json(true)
    })
    .catch(function (e) {
      res.json(false)
    })
}

exports.doesEmailExist = async function (req, res) {
  let emailBool = await User.doesEmailExist(req.body.email)
  res.json(emailBool)
}

exports.apiLogin = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function (result) {
      const data = {
        _id: user.data._id,
        username: user.data.username,
        avatar: user.avatar,
        token: jwt.sign({ _id: user.data._id, username: user.data.username, avatar: user.avatar }, process.env.JWTSECRET, { expiresIn: tokenLasts }),
      }
      responseHandler(200, data, res)
    })
    .catch(function (e) {
      errorHandler(401, e, res)
    })
}

exports.apiRegister = function (req, res) {
  let user = new User(req.body)
  user
    .register()
    .then(() => {
      const data = {
        token: jwt.sign({ _id: user.data._id, username: user.data.username, avatar: user.avatar }, process.env.JWTSECRET, { expiresIn: tokenLasts }),
        username: user.data.username,
        avatar: user.avatar
      }
      responseHandler(200, data, res)
    })
    .catch(regErrors => {
      errorHandler(500, regErrors, res)
    })
}

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument
      next()
    })
    .catch(function (e) {
      res.json(false)
    })
}

exports.profileBasicData = function (req, res) {
  res.json({
    profileUsername: req.profileUser.username,
    profileAvatar: req.profileUser.avatar,
    isFollowing: req.isFollowing,
    counts: { postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount }
  })
}

exports.getUserInfoById = async function (req, res) {
  try {
    const result = await User.getUserInfoById(req.params.userId)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(500, error, res)
  }
}
