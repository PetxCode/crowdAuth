"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const router = express_1.default.Router();
router.route("/create-account").post(authController_1.createAccount);
router.route("/all-account").get(authController_1.allAccount);
router.route("/:accountID/single-account").get(authController_1.getSingleAccount);
router.route("/:token/first-mail").post(authController_1.firstAccountVerification);
router.route("/:token/verify-account").get(authController_1.accountVerification);
exports.default = router;
