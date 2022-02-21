const Restaurant = require("../models/Restaurant")

exports.create = function (req, res) {
  let post = new Restaurant(req.body, req.apiUser._id)
  post
    .create()
    .then(function (newId) {
      res.json(newId)
    })
    .catch(function (errors) {
      res.json(errors)
    })
}

exports.getAll = async function (req, res) {
  try {
    let list = await Restaurant.getAll()
    res.json(list)
  } catch (e) {
    res.json(e)
  }
}

exports.getDetailById = async function (req, res) {
  try {
    let detail = await Restaurant.getDetailById(req.params.id)
    res.json(detail)
  } catch (e) {
    res.json(e)
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
