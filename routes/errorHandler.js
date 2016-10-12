var errorHandler = function (error, request, response, next) {
    response.status(error.status || 500);
    delete error.status; //Redundant to have the error in the body

    response.json({
        message: error.message
    });
};

module.exports = errorHandler;