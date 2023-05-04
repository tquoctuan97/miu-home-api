const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const { responseHandler } = require("./helpers/response")

const authRoute = require("./routes/auth.route");
const restaurantsRoute = require("./routes/restaurants.route");
const usersRoute = require("./routes/users.route");

apiRouter.get("/", (req, res) => responseHandler(200, "Server is running", res))

apiRouter.use('/', authRoute);
apiRouter.use('/restaurants', restaurantsRoute);
apiRouter.use('/users', usersRoute);

apiRouter.get("/post/:id", postController.reactApiViewSingle)
apiRouter.post("/post/:id/edit", userController.apiMustBeLoggedIn, postController.apiUpdate)
apiRouter.delete("/post/:id", userController.apiMustBeLoggedIn, postController.apiDelete)
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreate)

module.exports = apiRouter
