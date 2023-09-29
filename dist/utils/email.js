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
exports.resetAccountPasswordMail = exports.sendSecondEmail = exports.sendFirstEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleID = "848542784186-9os7noa7qvcg3nckfu38s3bhob8u6oga.apps.googleusercontent.com";
const googleSecret = "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";
const googleRefresh = "1//04GgN8ydoI_ZdCgYIARAAGAQSNwF-L9IrKCOkFE95PncupZNTb3WCiygNcFb1vp20oW-1SMJTKzSWxnWw2B6nf4S85GXSTpgR44M";
const googleURL = "https://developer.google.com/oauthplayground";
const oAuth = new googleapis_1.google.auth.OAuth2(googleID, googleSecret, googleURL);
oAuth.setCredentials({ access_token: googleRefresh });
const URL = "https://crowded-auth.onrender.com";
const sendFirstEmail = (account) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transport = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientId: googleID,
                clientSecret: googleSecret,
                refreshToken: googleRefresh,
                accessToken: accessToken,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: account.id }, "secret");
        const sharedData = {
            url: `${URL}/api/${token}/verify-account`,
            code: account.secretKey,
        };
        const pathData = path_1.default.join(__dirname, "../views/FirstMailSent.ejs");
        const realData = yield ejs_1.default.renderFile(pathData, sharedData);
        const mailer = {
            from: "First Step-Account Opening 🚀🚀🚀 <codelabbest@gmail.com>",
            to: account.email,
            subject: "First Step",
            html: realData,
        };
        transport.sendMail(mailer);
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendFirstEmail = sendFirstEmail;
const sendSecondEmail = (account) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transport = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientId: googleID,
                clientSecret: googleSecret,
                refreshToken: googleRefresh,
                accessToken: accessToken,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: account.id }, "secret");
        const sharedData = {
            url: `${URL}/api/${token}/verify-account`,
        };
        const pathData = path_1.default.join(__dirname, "../views/SecondMailSent.ejs");
        const realData = yield ejs_1.default.renderFile(pathData, sharedData);
        const mailer = {
            from: "Final Step-Account Opening 🚀🚀🚀 <codelabbest@gmail.com>",
            to: account.email,
            subject: "Final Step",
            html: realData,
        };
        transport.sendMail(mailer);
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendSecondEmail = sendSecondEmail;
const resetAccountPasswordMail = (user, tokenID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transport = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientId: googleID,
                clientSecret: googleSecret,
                refreshToken: googleRefresh,
                accessToken: accessToken,
            },
        });
        const passedData = {
            userName: user.userName,
            url: `${URL}/${tokenID}/reset-account-password`,
        };
        const readData = path_1.default.join(__dirname, "../views/resetPassword.ejs");
        const data = yield ejs_1.default.renderFile(readData, passedData);
        const mailer = {
            from: "Congrate 🚀🚀🚀 <codelabbest@gmail.com>",
            to: user.email,
            subject: "Awesome",
            html: data,
        };
        transport.sendMail(mailer);
    }
    catch (error) {
        console.log(error);
    }
});
exports.resetAccountPasswordMail = resetAccountPasswordMail;
