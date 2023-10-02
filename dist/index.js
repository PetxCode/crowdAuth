"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router/router"));
const passport_1 = __importDefault(require("passport"));
require("./utils/social");
const cookie_session_1 = __importDefault(require("cookie-session"));
const connection_1 = require("./utils/connection");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const port = 3300;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
app
    .use((0, cookie_session_1.default)({
    name: `${process.env.SESSION_NAME}`,
    keys: [`${process.env.SESSION_KEY}`],
    maxAge: 2 * 60 * 60 * 100,
}))
    .use((req, res, next) => {
    if (req.session && !req.session.regenerate) {
        req.session.regenerate = (cb) => {
            cb();
        };
    }
    if (req.session && !req.session.save) {
        req.session.save = (cb) => {
            cb();
        };
    }
    next();
})
    .use(passport_1.default.initialize())
    .use(passport_1.default.session());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), function (req, res) {
    // Successful authentication, redirect home.
    // res.redirect("/");
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, "secret");
    res.status(200).json({
        message: "Well done...!",
        data: token,
    });
});
app.use("/api", router_1.default);
const server = app.listen(process.env.PORT || port, () => {
    console.log();
    console.log("Auth Service connected...");
});
process.on("unhandledRejection", (error) => {
    console.log("Error due to unhandledRejection");
    console.log(error);
    process.exit(1);
});
process.on("uncaughtException", (reason) => {
    console.log("Error due to uncaughtException");
    console.log(reason);
    server.close(() => {
        process.exit(1);
    });
});
(0, connection_1.consumeConnection)("profiled");
(0, connection_1.consumeAbegConnection)("beg");
