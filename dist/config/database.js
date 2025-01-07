"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect_DB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connect_DB = async (URL) => {
    try {
        await mongoose_1.default.connect(URL);
        console.log("Connected to DB Successfully");
    }
    catch (error) {
        console.error("Error occurred: ", error);
        process.exit(1);
    }
};
exports.connect_DB = connect_DB;
