"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const userModel_1 = require("../models/userModel");
class UserService {
    static async checkExistingUser(email) {
        const user = await userModel_1.User.findOne({ email });
        return !!user; //returns true if user exists
    }
    static async findUserById(id) {
        return await userModel_1.User.findById(id);
    }
    static async findUserByEmail(email) {
        return await userModel_1.User.findOne({ email });
    }
    static async findUserByRefreshToken(refreshToken) {
        return await userModel_1.User.findOne({ refreshToken });
    }
}
exports.UserService = UserService;
