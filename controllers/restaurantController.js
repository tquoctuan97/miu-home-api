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
  const status = req.query.status;
  try {
    let list = await Restaurant.getAll(status)
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
exports.getDishList = async function (req, res) {
  try {
    const result = await Restaurant.getDishList(req.params.id, req.query.typeId)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

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

// Combo
exports.getComboList = async function (req, res) {
  try {
    const result = await Restaurant.getComboList(req.params.id)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

exports.addCombo = async function (req, res) {
  try {
    const result = await Restaurant.addCombo(req.body, req.params.id)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}

exports.deleteCombo = async function (req, res) {
  try {
    const result = await Restaurant.deleteCombo(req.params.id, req.params.comboId)
    responseHandler(200, result, res)
  } catch (error) {
    errorHandler(400, error, res)
  }
}