var errorHandler = function (error, request, response, next) {
    if (error) {
        if (!error.status) {
            console.error(error.stack);
        }
        response.status(error.status || 500);
        response.json({
            message: error.message
        });
    }
};

module.exports = errorHandler;