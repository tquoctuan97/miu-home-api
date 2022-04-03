exports.errorHandler = (status, err, res) => {
  return res
  .status(status)
  .json({message: err})
}

exports.responseHandler = (status, data, res) => {
  return res.status(status).json({status: 'success', data})
}
