"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: process.env.PORT || "3000",
    DB_URL: process.env.DB_URL || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "7fc5bbc1aaa43e46549c2ebddee85012aa9490e0ec6a0707b94854a87b5dbe29bc6d2143371d1ec347c08966d830ba2db885feb976da0d2afa7d84001af7771a275bbee99e40df6008b05f16885c98e2f8c3e2c1075d47a039fecd7eab73bf262d3cdb39e9725c502c68777d049d29ec40b47b1aea83e6300fab5a06e8e2578d6b021bd6d3233aacdc267561da7cfd1b8dad407e3ac251f3fb83fa47ea79c8c09f3f8fecb59932dab0086ed7cb92171477a4da8cf35c9dff20a6b596b2b813f6b243876e885b8d48d826433d38493ec53107352eb27d5a6472ce5b617b69b6531144f23fe452740ef3b466e297261997dc2cc5fe78bc71c9d2efacfd9bc92625",
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "15d",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "502fda57d5fdd786187f515c705c700a1945fdf58be2dad2cfa6b0151d6bd8e7bf7796b316b87c49e8fce5671ee493977216b58c3a249cfad85ee5708f1470d6b914141c6082b3afd3bed9904120548d7556391717534a9f77956ddf510fc5acb6aff643e4b627fdd290cadc25d6239cb9cc068956d0b99e968f458654f994c010dcbc5f7db6f11c3e1379b30917bb34bd1fbff333d5bb5345ec60001af0d115f4f081aeffbc4f49fd2042604de1dcaac3febf47af18813110ab2c1a9741a65b4503740f28e783bcf8385d6ff791d536e0ba9b82d634fb3aebec72ed1ae3149b3e25d1df1af5e6b49c309131b1939a733e5025e15258b42e2a59b4e99d070d8e",
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "10m",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    OTP_EXPIRES: Number(process.env.OTP_EXPIRES) || 300000,
};
