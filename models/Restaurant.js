const rxntsCollection = require('../db').db().collection("restaurants")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const sanitizeHTML = require('sanitize-html')

// postsCollection.createIndex({title: "text", body: "text"})

let Restaurant = function (data, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
  // this.requestedPostId = requestedPostId
}

Restaurant.prototype.cleanUp = function () {
  if (typeof (this.data.name) != "string") { this.data.name = "" }
  if (typeof (this.data.thumbnail) != "string") { this.data.thumbnail = "" }
  // if (!Array.isArray(this.data.menu)) { this.data.menu = "" }
  if (!Array.isArray(this.data.menu.dishList)) { this.data.menu.dishList = "" }
  if (!Array.isArray(this.data.menu.dishType)) { this.data.menu.dishType = "" }
  if (typeof (this.data.status) != "string") { this.data.status = "" }

  const dishList = this.data.menu.dishList.map((item) => {
    if (typeof (item.name) != "string") { item.name = "" }
    if (typeof (item.price) != "number") { item.price = "" }
    if (typeof (item.typeId) != "string") { item.typeId = "" }
    if (typeof (item.img) != "string") { item.img = "" }

    return {
      _id: ObjectID(),
      name: sanitizeHTML(item.name.trim(), { allowedTags: [], allowedAttributes: {} }),
      price: item.price,
      img: sanitizeHTML(item.img.trim(), { allowedTags: [], allowedAttributes: {} }),
      typeId: item.typeId,
    }
  })

  const typeList = this.data.menu.typeList.map((item) => {
    if (typeof (item.name) != "string") { item.name = "" }

    return {
      _id: ObjectID(),
      name: sanitizeHTML(item.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    }
  })

  // get rid of any bogus properties
  this.data = {
    name: sanitizeHTML(this.data.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    thumbnail: sanitizeHTML(this.data.thumbnail.trim(), { allowedTags: [], allowedAttributes: {} }),
    menu: {
      typeList: typeList,
      dishList: dishList,
    },
    status: sanitizeHTML(this.data.status.trim(), { allowedTags: [], allowedAttributes: {} }),
    createdDate: new Date(),
    updatedDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Restaurant.prototype.validate = function () {
  if (this.data.name === "") { this.errors.push("You must provide a name") }
  if (this.data.menu.dishList.length < 0) { this.errors.push("You must provide dish list") }
  
  if (this.data.status === "") { 
    this.errors.push("You must provide a status") 
  } else if (!["draft","published","private"].includes(this.data.status)) { 
    this.errors.push("Only 3 statuses are allowed: draft, published, private") 
  }

  if(this.data.menu.typeList.length > 0) {
    this.data.menu.typeList.forEach((item, index) => {
      if (item.name === "") { this.errors.push(`Name of type item ${index} cannot be empty`) }
    })
  }

  this.data.menu.dishList.forEach((item, index) => {
    if (item.name === "") { this.errors.push(`Name of dish item ${index} cannot be empty`) }
    if (item.price === "") { this.errors.push(`Price of dish item ${index} cannot be empty`) }
    if (item.typeId !== "") { this.errors.push(`Only add typeId after creation, please remove typeId at ${index}`) }
  })
}

Restaurant.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
      rxntsCollection.insertOne(this.data).then((info) => {
        resolve(info.ops[0]._id)
      }).catch(e => {
        this.errors.push("Please try again later.")
        console.log(this.errors);
        reject(this.errors)
      })
    } else {
      reject(this.errors)
    }
  })
}

Restaurant.getAll = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let list = await rxntsCollection.find().toArray()

      list.forEach(item => {
        delete item.menu
      })

      resolve(list)
    } catch (e) {
      reject(e)
    }
  })
}

Restaurant.getDetailById = function (id) {
  return new Promise(async function (resolve, reject) {
    if (typeof (id) != "string" || !ObjectID.isValid(id)) {
      reject("Id is not valid")
      return
    }
    
    try {
      const list = await rxntsCollection.find({ _id: new ObjectID(id) }).toArray()
      if (list.length > 0) {
        resolve(list[0])
      } else {
        reject("Restaurant does not exist")
      }
    } catch (error) {
      reject(error)
    }
  })
}

Restaurant.updateInfo = function (data, id) {
  return new Promise(async function (resolve, reject) {

    try {
      await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }

    if (!data.name) {
      reject("Name is required")
      return
    }

    if (!data.author) {
      reject("Author is required")
      return
    }

    try {
      await User.doesUserExist(data.author)
    } catch (error) {
      reject(error)
      return
    }

    if (!data.status) {
      reject("Status is required")
      return
    } else if (!["draft","published","private"].includes(data.status)) { 
      reject("Only 3 statuses are allowed: draft, published, private") 
      return
    }

    if (data.menu) {
      reject("If you want to update menu, request /restaurant/:id/menu")
      return
    }

    if (!data.thumbnail) {
      data.thumbnail = ""
    }

    try {
      const res = await rxntsCollection.findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            name: data.name,
            thumbnail: data.thumbnail,
            status: data.status,
            author: data.author,
            updatedDate: new Date(),
          }
        }
      )
      if(res) {
        resolve("Update Success")
      }
    } catch (error) {
      reject(error);
    }
  })
}

Restaurant.delete = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      await rxntsCollection.deleteOne({ _id: new ObjectID(id) })
      resolve("Delete Restaurant Success")
    } catch (e) {
      reject(e)
    }
  })
}

// Type of Dish
Restaurant.doesTypeExist = function (id, typeId) {
  return new Promise(async function (resolve, reject) {

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }

    if (typeof (typeId) != "string" || !ObjectID.isValid(typeId)) {
      reject("typeId is no valid")
      return
    } 
    
    const result = restaurant.menu.typeList.find(item => item._id == typeId)
    
    if(result) {
      resolve(true)  
    } else {
      reject(`TypeId does not exist`)
    }
  })
}

Restaurant.getTypeList = function (id) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await Restaurant.getDetailById(id);
      resolve(result.menu.typeList)
    } catch (error) {
      reject(error)
    }
  })
}

Restaurant.addType = function (data, id) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }

    if (data.name === "") {
      reject("Name is required")
      return
    }

    const typeList = restaurant.menu.typeList

    const typeId = ObjectID()

    const type = {
      _id: typeId,
      name: data.name,
    }
  

    const newTypeList = typeList.concat([type])
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: newTypeList,
              dishList: restaurant.menu.dishList
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve(typeId)
    } else {
      reject("Error")
    }
  })
}

Restaurant.updateType = function (data, id, typeId) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id)
      await Restaurant.doesTypeExist(id, typeId)
    } catch (error) {
      reject(error)
      return
    }

    if (data.name === "") {
      reject("Name is required")
      return
    }

    const typeList = restaurant.menu.typeList

    const newTypeList = typeList.map(item => {
      if (item._id == typeId) {
        return {
          _id: item._id,
          ...data
        }
      }
      return item
    })

    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: newTypeList,
              dishList: restaurant.menu.dishList 
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Update Type Success")
    } else {
      reject("Error")
    }
  })
}

Restaurant.deleteType = function (id, typeId) {
  return new Promise(async function (resolve, reject) {

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id)
      await Restaurant.doesTypeExist(id, typeId)
    } catch (error) {
      reject(error)
      return
    }

    const typeList = restaurant.menu.typeList

    const newTypeList = typeList.filter(item => {
      return item._id != typeId
    })
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: newTypeList,
              dishList: restaurant.menu.dishList
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Delete Type Success");
    } else {
      reject("Error")
    }
  })
}

// Dishes
Restaurant.doesDishExist = function (id, dishId) {
  return new Promise(async function (resolve, reject) {

    if (typeof (id) != "string" || !ObjectID.isValid(id)) {
      reject("Restaurant Id is no valid")
      return
    }

    if (typeof (dishId) != "string" || !ObjectID.isValid(dishId)) {
      reject("dishId is no valid")
      return
    } 

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }

    const result = restaurant.menu.dishList.find(item => item._id == dishId)
    
    if(result) {
      resolve(true)  
    } else {
      reject(`dishId does not exist`)
    }
  })
}

Restaurant.getDishList = function (id, typeId) {
  return new Promise(async function (resolve, reject) {

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
      if(typeId) {
        await Restaurant.doesTypeExist(id, typeId);
      }
    } catch (error) {
      reject(error)
      return
    }

    if(!typeId) {
      resolve(restaurant.menu.dishList)
      return
    }

    const filterDishList = restaurant.menu.dishList.filter(item => item.typeId === typeId)

    if(filterDishList.length > 0) {
      resolve(filterDishList)
    } else {
      reject(`Dish List by ${typeId} is empty`)
    }
  })
}

Restaurant.addDish = function (data, id) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }

    if (data.name === "") {
      reject("Name is required")
      return
    }

    if (data.price === "" || typeof (data.price) != "number") {
      reject("Price is required")
      return
    }

    const dishId = ObjectID()

    const dishItem = {
      _id: dishId,
      name: data.name,
      price: data.price,
      img: "",
      typeId: "",
    }

    if(data.img) {
      dishItem.img = data.img
    }

    try {
      const result = await Restaurant.doesTypeExist(id, data.typeId)
      if(result) {
        dishItem.typeId = data.typeId
      }
    } catch (error) {
      reject(error)
      return
    }

    const newDishList = [...restaurant.menu.dishList]

    newDishList.push(dishItem)
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: restaurant.menu.typeList,
              dishList: newDishList
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve(dishId)
    } else {
      reject("Error")
    }
  })
}

Restaurant.updateDish = function (data, id, dishId) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
      await Restaurant.doesDishExist(id, dishId);
    } catch (error) {
      reject(error)
      return
    }

    if (data.name === "") {
      reject("Name is required")
      return
    }

    if (data.price === "" || typeof (data.price) != "number") {
      reject("Price is required")
      return
    }

    if(data.typeId) {
      try {
        const result = await Restaurant.doesTypeExist(id, data.typeId)
        if(result) {
          dishItem.typeId = data.typeId
        }
      } catch (error) {
        reject(error)
        return
      }
    }

    const newDishList = restaurant.menu.dishList.map(item => {
      if (item._id == dishId) {
        return {
          _id: item._id,
          ...data
        }
      }
      return item
    })

    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: restaurant.menu.typeList,
              dishList: newDishList,
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Update Dish Success")
    } else {
      reject("Error")
    }
  })
}

Restaurant.deleteDish = function (id, dishId) {
  return new Promise(async function (resolve, reject) {

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
      await Restaurant.doesDishExist(id, dishId);
    } catch (error) {
      reject(error)
      return
    }

    const newDishList = restaurant.menu.dishList.filter(item => {
      return item._id != dishId
    })
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: restaurant.menu.typeList,
              dishList: newDishList,
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Delete Dish Success");
    } else {
      reject("Error")
    }
  })
}

Restaurant.deleteAllDish = function (id) {
  return new Promise(async function (resolve, reject) {

    let restaurant = {}

    try {
      restaurant = await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error)
      return
    }
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: {
              typeList: restaurant.menu.typeList,
              dishList: []
            },
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Delete All Dishes Success");
    } else {
      reject("Error")
    }
  })
}


module.exports = Restaurant
