"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = exports.deleteUser = exports.changeAccountPassword = exports.resetAccountPassword = exports.SignInUser = exports.accountVerification = exports.firstAccountVerification = exports.getSingleAccount = exports.allAccount = exports.createAccount = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const tokenValue = crypto_1.default.randomBytes(2).toString("hex");
        const secretKey = crypto_1.default.randomBytes(2).toString("hex");
        const token = jsonwebtoken_1.default.sign(tokenValue, "token");
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashed = yield bcrypt_1.default.hash(password, salt);
        const account = yield prisma.crowdAuth.create({
            data: {
                email,
                password: hashed,
                secretKey,
                token,
                profile: [],
                abeg: [],
            },
        });
        (0, email_1.sendFirstEmail)(account).then(() => {
            console.log("Mail Sent...");
        });
        return res.status(201).json({
            message: "Your Account has been created successfully",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.createAccount = createAccount;
const allAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield prisma.crowdAuth.findMany({});
        return res.status(200).json({
            message: "Viewing all Account",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.allAccount = allAccount;
const getSingleAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountID } = req.params;
        const account = yield prisma.crowdAuth.findUnique({
            where: { id: accountID },
        });
        return res.status(200).json({
            message: "Viewing single Account",
            data: account,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error,
        });
    }
});
exports.getSingleAccount = getSingleAccount;
const firstAccountVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { secretKey } = req.body;
        const { token } = req.params;
        jsonwebtoken_1.default.verify(token, "secret", (error, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                throw new Error();
            }
            else {
                const account = yield prisma.crowdAuth.findUnique({
                    where: { id: payload.id },
                });
                if ((account === null || account === void 0 ? void 0 : account.secretKey) === secretKey) {
                    (0, email_1.sendSecondEmail)(account).then(() => {
                        console.log("Mail Sent...");
                    });
                    return res.status(200).json({
                        message: "PLease to verify your Account",
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Error with your Token",
                    });
                }
            }
        }));
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.firstAccountVerification = firstAccountVerification;
const accountVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        jsonwebtoken_1.default.verify(token, "secret", (error, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                throw new Error();
            }
            else {
                const account = yield prisma.crowdAuth.findUnique({
                    where: { id: payload.id },
                });
                if (account) {
                    yield prisma.crowdAuth.update({
                        where: { id: payload.id },
                        data: {
                            token: "",
                            verify: true,
                        },
                    });
                    return res.status(200).json({
                        message: "Congratulation your account has been Verifify!!!",
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Error with your Token",
                    });
                }
            }
        }));
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.accountVerification = accountVerification;
const SignInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.crowdAuth.findUnique({
            where: { email },
        });
        if (user) {
            const check = yield bcrypt_1.default.compare(password, user.password);
            if (check) {
                if (user.verify && user.token === "") {
                    const token = jsonwebtoken_1.default.sign({
                        id: user.id,
                    }, "secret", { expiresIn: "3d" });
                    return res.status(201).json({
                        message: `Welcome back ${user.email}`,
                        user: token,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Please go and verify your account",
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "check your password",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "cannot find user",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error signing in",
        });
    }
});
exports.SignInUser = SignInUser;
const resetAccountPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield prisma.crowdAuth.findUnique({
            where: { email },
        });
        if ((user === null || user === void 0 ? void 0 : user.verify) && user.token === "") {
            const token = jsonwebtoken_1.default.sign({ id: user.id }, "secret");
            yield prisma.crowdAuth.update({
                where: { id: user.id },
                data: {
                    token,
                },
            });
            (0, email_1.resetAccountPasswordMail)(user, token).then(() => {
                console.log("message Sent...!");
            });
            console.log("4: ", email);
            return res.status(201).json({
                message: "You can now change your Password",
            });
        }
        else {
            return res.status(404).json({
                message: "can't reset this password",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reseting password",
            data: error,
        });
    }
});
exports.resetAccountPassword = resetAccountPassword;
const changeAccountPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const getID = jsonwebtoken_1.default.verify(token, "secret", (err, payload) => {
            if (err) {
                return err;
            }
            else {
                return payload.id;
            }
        });
        const user = yield prisma.crowdAuth.findUnique({
            where: { id: getID },
        });
        if ((user === null || user === void 0 ? void 0 : user.verify) && user.token !== "") {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashed = yield bcrypt_1.default.hash(password, salt);
            yield prisma.crowdAuth.update({
                where: { id: user.id },
                data: {
                    password: hashed,
                },
            });
            return res.status(201).json({
                message: "Your password has been changed",
            });
        }
        else {
            return res.status(404).json({
                message: "can't change this password",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error changing password",
            data: error,
        });
    }
});
exports.changeAccountPassword = changeAccountPassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        const Delete = yield prisma.crowdAuth.delete({
            where: { id: userID },
        });
        return res.status(201).json({
            message: `${Delete.email} your account has been deleted`,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting Account",
            data: error,
        });
    }
});
exports.deleteUser = deleteUser;
const UpdateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountID } = req.params;
        const update = yield prisma.crowdAuth.update({
            where: { id: accountID },
            data: {
                profile: req.body,
            },
        });
        return res.status(201).json({
            message: "updated",
            data: update,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error updatng",
            data: error,
        });
    }
});
exports.UpdateUser = UpdateUser;
