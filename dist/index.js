"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const PORT = env_1.config.PORT;
const DB_URL = env_1.config.DB_URL;
(0, database_1.connect_DB)(DB_URL);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.get('/api/v1/status', (req, res) => {
    res.status(200).json({
        status: "OK"
    });
});
app.use("/api/v1/auth", authRoutes_1.default);
app.use(ErrorHandler_1.ErrorHandler);
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
