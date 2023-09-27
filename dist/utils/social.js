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
const passport_1 = __importDefault(require("passport"));
const client_1 = require("@prisma/client");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const prisma = new client_1.PrismaClient();
const GOOGLE_CLIENT_ID = "199704572461-mqftjmpvtc6k62t49ki4mshaocr0e6hf.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport_1.default.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"],
}, function (accessToken, refreshToken, profile, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (profile.id_token) {
                const data = (0, jwt_decode_1.default)(profile.id_token);
                console.log(data);
                if (data) {
                    const user = yield prisma.crowdAuth.findUnique({
                        where: { email: data.email },
                    });
                    if (user) {
                        return callback(null, user);
                    }
                    else {
                        const newUser = yield prisma.crowdAuth.create({
                            data: {
                                email: data.email,
                                password: "",
                                secretKey: "er45",
                                token: "",
                                verify: data.email_verified,
                                abeg: [],
                                profile: [],
                            },
                        });
                        return callback(null, newUser);
                    }
                }
                else {
                    console.log("check Token...");
                }
            }
            else {
                const user = yield prisma.crowdAuth.findUnique({
                    where: { email: profile._json.email },
                });
                if (user) {
                    return callback(null, user);
                }
                else {
                    const newUser = yield prisma.crowdAuth.create({
                        data: {
                            email: profile._json.email,
                            password: "",
                            secretKey: "er45",
                            token: "",
                            verify: true,
                            abeg: [],
                            profile: [],
                        },
                    });
                    return callback(null, newUser);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}));
