const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
const restaurantController = require("./controllers/restaurantController")
const cors = require("cors")

apiRouter.use(cors())

apiRouter.get("/", (req, res) => res.json("Hello, if you see this message that means your backend is up and running successfully. Congrats! Now let's continue learning React!"))

// check token to log out front-end if expired
apiRouter.post("/checkToken", userController.checkToken)

apiRouter.post("/getHomeFeed", userController.apiMustBeLoggedIn, userController.apiGetHomeFeed)
apiRouter.post("/register", userController.apiRegister)
apiRouter.post("/login", userController.apiLogin)
apiRouter.get("/post/:id", postController.reactApiViewSingle)
apiRouter.post("/post/:id/edit", userController.apiMustBeLoggedIn, postController.apiUpdate)
apiRouter.delete("/post/:id", userController.apiMustBeLoggedIn, postController.apiDelete)
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreate)
apiRouter.post("/search", postController.search)

// Restaurant
apiRouter.get("/restaurants", restaurantController.getAll)

apiRouter.get("/restaurants/:id", restaurantController.getDetailById)
apiRouter.post("/restaurants", userController.apiMustBeLoggedIn, restaurantController.create)
apiRouter.delete("/restaurants/:id", userController.apiMustBeLoggedIn, restaurantController.delete)
apiRouter.put("/restaurants/:id", userController.apiMustBeLoggedIn, restaurantController.update)

// Menu Item
apiRouter.post("/restaurants/:id/menu/", userController.apiMustBeLoggedIn, restaurantController.addMenuItem)
apiRouter.delete("/restaurants/:id/menu/", userController.apiMustBeLoggedIn, restaurantController.deleteMenu)

apiRouter.put("/restaurants/:id/menu/:itemId", userController.apiMustBeLoggedIn, restaurantController.updateMenuItem)
apiRouter.delete("/restaurants/:id/menu/:itemId", userController.apiMustBeLoggedIn, restaurantController.deleteMenuItem)



apiRouter.post("/doesUsernameExist", userController.doesUsernameExist)
apiRouter.post("/doesEmailExist", userController.doesEmailExist)

// profile related routes
apiRouter.post("/profile/:username", userController.ifUserExists, userController.sharedProfileData, userController.profileBasicData)
apiRouter.get("/profile/:username/posts", userController.ifUserExists, userController.apiGetPostsByUsername)
apiRouter.get("/profile/:username/followers", userController.ifUserExists, userController.profileFollowers)
apiRouter.get("/profile/:username/following", userController.ifUserExists, userController.profileFollowing)

// follow routes
apiRouter.post("/addFollow/:username", userController.apiMustBeLoggedIn, followController.apiAddFollow)
apiRouter.post("/removeFollow/:username", userController.apiMustBeLoggedIn, followController.apiRemoveFollow)

module.exports = apiRouter
