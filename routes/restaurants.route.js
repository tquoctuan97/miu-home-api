const restaurants = require("express").Router();
const restaurantController = require("../controllers/restaurantController")
const userController = require("../controllers/userController")

restaurants.get("/", restaurantController.getAll)

restaurants.get("/:id", restaurantController.getDetailById)
restaurants.post("/", userController.apiMustBeLoggedIn, restaurantController.create)
restaurants.delete("/:id", userController.apiMustBeLoggedIn, restaurantController.delete)
restaurants.put("/:id", userController.apiMustBeLoggedIn, restaurantController.update)

// Type Of Dish
restaurants.get("/:id/types/", restaurantController.getTypeList)
restaurants.post("/:id/types/", userController.apiMustBeLoggedIn, restaurantController.addType)
restaurants.put("/:id/types/:typeId", userController.apiMustBeLoggedIn, restaurantController.updateType)
restaurants.delete("/:id/types/:typeId", userController.apiMustBeLoggedIn, restaurantController.deleteType)

// Dish
restaurants.get("/:id/dishes/", restaurantController.getDishList)
restaurants.post("/:id/dishes/", userController.apiMustBeLoggedIn, restaurantController.addDish)
restaurants.put("/:id/dishes/:dishId", userController.apiMustBeLoggedIn, restaurantController.updateDish)
restaurants.delete("/:id/dishes/:dishId", userController.apiMustBeLoggedIn, restaurantController.deleteDish)

restaurants.delete("/:id/dishes/", userController.apiMustBeLoggedIn, restaurantController.deleteAllDish)

// Combo
restaurants.get("/:id/combos/", restaurantController.getComboList)
restaurants.post("/:id/combos/", userController.apiMustBeLoggedIn, restaurantController.addCombo)
restaurants.delete("/:id/combos/:comboId", userController.apiMustBeLoggedIn, restaurantController.deleteCombo)

module.exports = restaurants