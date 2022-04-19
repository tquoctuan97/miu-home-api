const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
const restaurantController = require("./controllers/restaurantController")
const cors = require("cors")
const { responseHandler } = require("./helpers/response")

apiRouter.use(cors())

apiRouter.get("/", (req, res) => responseHandler(200, "Server is running", res))

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


// Type Of Dish
apiRouter.get("/restaurants/:id/types/", restaurantController.getTypeList)
apiRouter.post("/restaurants/:id/types/", userController.apiMustBeLoggedIn, restaurantController.addType)
apiRouter.put("/restaurants/:id/types/:typeId", userController.apiMustBeLoggedIn, restaurantController.updateType)
apiRouter.delete("/restaurants/:id/types/:typeId", userController.apiMustBeLoggedIn, restaurantController.deleteType)

// Dish
apiRouter.get("/restaurants/:id/dishes/", restaurantController.getDishList)
apiRouter.post("/restaurants/:id/dishes/", userController.apiMustBeLoggedIn, restaurantController.addDish)
apiRouter.put("/restaurants/:id/dishes/:dishId", userController.apiMustBeLoggedIn, restaurantController.updateDish)
apiRouter.delete("/restaurants/:id/dishes/:dishId", userController.apiMustBeLoggedIn, restaurantController.deleteDish)

apiRouter.delete("/restaurants/:id/dishes/", userController.apiMustBeLoggedIn, restaurantController.deleteAllDish)

// User
apiRouter.get("/users/:userId", userController.getUserInfoById)
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
