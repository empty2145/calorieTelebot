function errorHandler(error, name, from) {
    let loggerFunction = console.log;

    loggerFunction("------------START------------");
    loggerFunction("Error in occured in " + name);

    if (from === "axios") {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            loggerFunction(error.response.data);
            loggerFunction(error.response.status);
            loggerFunction(error.response.headers);
        } else if (error.request) {
            loggerFunction(error.request);
        } else {
            logger("Error", error.message);
        }
        loggerFunction(error.toJSON)
    } else {
        loggerFunction(error);
    }

    loggerFunction("------------END------------")
}

module.exports = {
    errorHandler,
}