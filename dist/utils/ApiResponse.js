"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_Response = void 0;
const API_Response = (res, statusCode, success, message = null, token = null, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        token,
        data
    });
};
exports.API_Response = API_Response;
