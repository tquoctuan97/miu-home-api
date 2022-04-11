const { responseHandler, errorHandler } = require("../helpers/response")
const Restaurant = require("../models/Restaurant")

exports.create = function (req, res) {
  let post = new Restaurant(req.body, req.apiUser._id)
  post
    .create()
    .then(function (newId) {
      responseHandler(201, newId, res);
    })
    .catch(function (error) {
      errorHandler(400, error, res);
    })
}

exports.getAll = async function (req, res) {
  try {
    let list = await Restaurant.getAll()
    responseHandler(200, list, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

exports.getDetailById = async function (req, res) {
  try {
    let detail = await Restaurant.getDetailById(req.params.id)
    return responseHandler(200, detail, res);
  } catch (error) {
    return errorHandler(400, error, res);
  }
}

exports.update = async function (req, res) {
  try {
    const result = await Restaurant.updateInfo(req.body, req.params.id);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

exports.delete = async function (req, res) {
  try {
    const result = await Restaurant.delete(req.params.id);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

// Types
exports.getTypeList = async function (req, res) {
  try {
    const result = await Restaurant.getTypeList(req.params.id)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

exports.addType = async function (req, res) {
  try {
    const result = await Restaurant.addType(req.body, req.params.id)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

exports.updateType = async function (req, res) {
  try {
    const result = await Restaurant.updateType(req.body, req.params.id, req.params.typeId)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

exports.deleteType = async function (req, res) {
  try {
    const result = await Restaurant.deleteType(req.params.id, req.params.typeId)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

// Dishes
exports.addDish = async function (req, res) {
  try {
    const result = await Restaurant.addDish(req.body, req.params.id);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

exports.updateDish = async function (req, res) {
  try {
    const result = await Restaurant.updateDish(req.body, req.params.id, req.params.dishId);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

exports.deleteDish = async function (req, res) {
  try {
    const result = await Restaurant.deleteDish(req.params.id, req.params.dishId);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}

exports.deleteAllDish = async function (req, res) {
  try {
    const result = await Restaurant.deleteAllDish(req.params.id);
    responseHandler(200, result, res);
  } catch (error) {
    errorHandler(400, error, res);
  }
}


// exports.apiUpdate = function (req, res) {
//   let post = new Post(req.body, req.apiUser._id, req.params.id)
//   post
//     .update()
//     .then(status => {
//       // the post was successfully updated in the database
//       // or user did have permission, but there were validation errors
//       if (status == "success") {
//         res.json("success")
//       } else {
//         res.json("failure")
//       }
//     })
//     .catch(e => {
//       // a post with the requested id doesn't exist
//       // or if the current visitor is not the owner of the requested post
//       res.json("no permissions")
//     })
// }

// exports.apiDelete = function (req, res) {
//   Post.delete(req.params.id, req.apiUser._id)
//     .then(() => {
//       res.json("Success")
//     })
//     .catch(e => {
//       res.json("You do not have permission to perform that action.")
//     })
// }

// exports.search = function (req, res) {
//   Post.search(req.body.searchTerm)
//     .then(posts => {
//       res.json(posts)
//     })
//     .catch(e => {
//       res.json([])
//     })
// }

// exports.reactApiViewSingle = async function (req, res) {
//   try {
//     let post = await Post.findSingleById(req.params.id, 0)
//     res.json(post)
//   } catch (e) {
//     res.json(false)
//   }
// }
