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
  if (!Array.isArray(this.data.menu)) { this.data.menu = "" }
  if (typeof (this.data.status) != "string") { this.data.status = "" }

  // get rid of any bogus properties
  const menu = this.data.menu.map((item) => {
    if (typeof (item.name) != "string") { item.name = "" }
    if (typeof (item.price) != "number") { item.price = "" }
    if (typeof (item.img) != "string") { item.img = "" }

    return {
      _id: ObjectID(),
      name: sanitizeHTML(item.name.trim(), { allowedTags: [], allowedAttributes: {} }),
      price: item.price,
      img: sanitizeHTML(item.img.trim(), { allowedTags: [], allowedAttributes: {} }),
    }
  })

  this.data = {
    name: sanitizeHTML(this.data.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    thumbnail: sanitizeHTML(this.data.thumbnail.trim(), { allowedTags: [], allowedAttributes: {} }),
    menu: menu,
    status: sanitizeHTML(this.data.status.trim(), { allowedTags: [], allowedAttributes: {} }),
    createdDate: new Date(),
    updatedDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Restaurant.prototype.validate = function () {
  if (this.data.name === "") { this.errors.push("You must provide a name") }
  if (this.data.menu.length < 0) { this.errors.push("You must provide menu") }
  
  if (this.data.status === "") { 
    this.errors.push("You must provide a status") 
  } else if (!["draft","published","private"].includes(this.data.status)) { 
    this.errors.push("Only 3 statuses allowed: draft, published, private") 
  }

  this.data.menu.forEach((item, index) => {
    if (item.name === "") { this.errors.push(`Name of item ${index} cannot be empty`) }
    if (item.price === "") { this.errors.push(`Price of item ${index} cannot be empty`) }
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
    }
    
    try {
      const list = await rxntsCollection.find({ _id: new ObjectID(id) }).toArray()
      if (list.length > 0) {
        resolve(list[0])
      } else {
        reject("Not Found")
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
      reject(error);
    }

    if (!data.name) {
      reject("Name is required");
    }

    if (!data.author) {
      reject("Author is required");
    }

    try {
      await User.doesUserExist(data.author)
    } catch (error) {
      reject(error);
    }

    if (!data.status) {
      reject("Status is required");
    } else if (!["draft","published","private"].includes(data.status)) { 
      reject("Only 3 statuses allowed: draft, published, private") 
    }

    if (data.menu) {
      reject("If you want to update menu, request /restaurant/:id/menu");
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

Restaurant.addMenuItem = function (data, id) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    try {
      await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error);
    }

    if (data.name === "") {
      reject("Name is required")
    }

    if (data.price === "" || typeof (data.price) != "number") {
      reject("Price is required")
    }

    const { menu } = await Restaurant.getDetailById(id)

    const itemId = ObjectID()

    const menuItem = {
      _id: itemId,
      name: data.name,
      price: data.price,
      img: ""
    }

    if(data.img) {
      menuItem.img = data.img
    }

    const newMenu = menu.concat([menuItem])
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: newMenu,
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve(itemId)
    } else {
      reject("Error")
    }
  })
}

Restaurant.updateMenuItem = function (data, id, itemId) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    if (typeof (id) != "string" || !ObjectID.isValid(id)) {
      reject("Restaurant Id is no valid")
    }

    if (typeof (itemId) != "string" || !ObjectID.isValid(itemId)) {
      reject("Item Id is no valid")
    }

    if (data.name === "") {
      reject("Name is required")
    }

    if (data.price === "" || typeof (data.price) != "number") {
      reject("Price is required")
    }

    const { menu } = await Restaurant.getDetailById(id)

    const newMenu = menu.map(item => {
      if (item._id == itemId) {
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
            menu: newMenu,
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Update Item Success")
    } else {
      reject("Error")
    }
  })
}

Restaurant.deleteMenuItem = function (id, itemId) {
  return new Promise(async function (resolve, reject) {

    try {
      await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error);
    }

    if (typeof (itemId) != "string" || !ObjectID.isValid(itemId)) {
      reject("Item Id is no valid")
    }

    const { menu } = await Restaurant.getDetailById(id)

    const newMenu = menu.filter(item => {
      return item._id != itemId
    })

  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: newMenu,
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Delete Menu Item Success");
    } else {
      reject("Error")
    }
  })
}

Restaurant.deleteMenu = function (id) {
  return new Promise(async function (resolve, reject) {

    try {
      await Restaurant.getDetailById(id);
    } catch (error) {
      reject(error);
    }
  
    let res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            menu: [],
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Delete Menu Success");
    } else {
      reject("Error")
    }
  })
}


module.exports = Restaurant
