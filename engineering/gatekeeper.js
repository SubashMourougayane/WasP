const response = (res, code, message) => {
    return res.status(code).send(message)
}

exports.response = response;
