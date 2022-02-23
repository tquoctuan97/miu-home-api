const rxntsCollection = require('../db').db().collection("restaurants")
const ObjectID = require('mongodb').ObjectID
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
    createdDate: new Date(),
    updatedDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Restaurant.prototype.validate = function () {
  if (this.data.name === "") { this.errors.push("You must provide a name") }
  if (this.data.menu.length < 0) { this.errors.push("You must provide menu") }

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
      return
    }

    let list = await rxntsCollection.find({ _id: new ObjectID(id) }).toArray()

    if (list.length > 0) {
      resolve(list[0])
    } else {
      reject("Not Found")
    }
  })
}

Restaurant.update = function (data, id) {
  return new Promise(async function (resolve, reject) {

    delete data.token

    if (typeof (id) != "string" || !ObjectID.isValid(id)) {
      reject("Id is not valid")
    }

    if (data.name === "") {
      reject("Name is required");
    }

    if (data.menu !== undefined) {
      if (!Array.isArray(data.menu) || data.menu.length === 0 || data.menu === "") {
        reject("Menu is not valid");
      }

      data.menu.forEach(item => {
        if (item.name === "") {
          reject("Name is required")
        }
        if (item.price === "" || typeof (item.price) != "number") {
          reject("Price is required")
        }
      })

      data.menu = data.menu.map(item => {
        return {
          _id: ObjectID(),
          ...item,
        }
      })
    }

    const res = await rxntsCollection
      .findOneAndUpdate({ _id: new ObjectID(id) },
        {
          $set: {
            ...data,
            updatedDate: new Date(),
          }
        }
      )

    if (res) {
      resolve("Update Success")
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

// Restaurant.prototype.update = function () {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let post = await Post.findSingleById(this.requestedPostId, this.userid)
//       if (post.isVisitorOwner) {
//         // actually update the db
//         let status = await this.actuallyUpdate()
//         resolve(status)
//       } else {
//         reject()
//       }
//     } catch (e) {
//       reject()
//     }
//   })
// }

// Restaurant.prototype.actuallyUpdate = function () {
//   return new Promise(async (resolve, reject) => {
//     this.cleanUp()
//     this.validate()
//     if (!this.errors.length) {
//       await postsCollection.findOneAndUpdate({ _id: new ObjectID(this.requestedPostId) }, { $set: { title: this.data.title, body: this.data.body } })
//       resolve("success")
//     } else {
//       resolve("failure")
//     }
//   })
// }

// Restaurant.reusablePostQuery = function (uniqueOperations, visitorId, finalOperations = []) {
//   return new Promise(async function (resolve, reject) {
//     let aggOperations = uniqueOperations.concat([
//       { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
//       {
//         $project: {
//           title: 1,
//           body: 1,
//           createdDate: 1,
//           authorId: "$author",
//           author: { $arrayElemAt: ["$authorDocument", 0] }
//         }
//       }
//     ]).concat(finalOperations)

//     let posts = await postsCollection.aggregate(aggOperations).toArray()

//     // clean up author property in each post object
//     posts = posts.map(function (post) {
//       post.isVisitorOwner = post.authorId.equals(visitorId)
//       post.authorId = undefined

//       post.author = {
//         username: post.author.username,
//         avatar: new User(post.author, true).avatar
//       }

//       return post
//     })

//     resolve(posts)
//   })
// }

// Restaurant.findByAuthorId = function (authorId) {
//   return Post.reusablePostQuery([
//     { $match: { author: authorId } },
//     { $sort: { createdDate: -1 } }
//   ])
// }

// Restaurant.delete = function (postIdToDelete, currentUserId) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let post = await Post.findSingleById(postIdToDelete, currentUserId)
//       if (post.isVisitorOwner) {
//         await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) })
//         resolve()
//       } else {
//         reject()
//       }
//     } catch (e) {
//       reject()
//     }
//   })
// }


// Restaurant.search = function (searchTerm) {
//   return new Promise(async (resolve, reject) => {
//     if (typeof (searchTerm) == "string") {
//       let posts = await Post.reusablePostQuery([
//         { $match: { $text: { $search: searchTerm } } }
//       ], undefined, [{ $sort: { score: { $meta: "textScore" } } }])
//       resolve(posts)
//     } else {
//       reject()
//     }
//   })
// }

// Restaurant.countPostsByAuthor = function (id) {
//   return new Promise(async (resolve, reject) => {
//     let postCount = await postsCollection.countDocuments({ author: id })
//     resolve(postCount)
//   })
// }

// Restaurant.getFeed = async function (id) {
//   // create an array of the user ids that the current user follows
//   let followedUsers = await followsCollection.find({ authorId: new ObjectID(id) }).toArray()
//   followedUsers = followedUsers.map(function (followDoc) {
//     return followDoc.followedId
//   })

//   // look for posts where the author is in the above array of followed users
//   return Post.reusablePostQuery([
//     { $match: { author: { $in: followedUsers } } },
//     { $sort: { createdDate: -1 } }
//   ])
// }

module.exports = Restaurant
