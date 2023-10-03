import express, { Application, NextFunction, Response } from "express";
import cors from "cors";
import auth from "./router/router";
import passport from "passport";
import "./utils/social";
import cookieSession from "cookie-session";
import { consumeAbegConnection, consumeConnection } from "./utils/connection";
import jwt from "jsonwebtoken";

const port: number = 3100;
const app: Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user!);
});

app
  .use(
    cookieSession({
      name: `${process.env.SESSION_NAME}`,
      keys: [`${process.env.SESSION_KEY}`],
      maxAge: 2 * 60 * 60 * 100,
    })
  )

  .use((req: any, res: Response, next: NextFunction) => {
    if (req.session && !req.session.regenerate) {
      req.session.regenerate = (cb: any) => {
        cb();
      };
    }
    if (req.session && !req.session.save) {
      req.session.save = (cb: any) => {
        cb();
      };
    }
    next();
  })
  .use(passport.initialize())
  .use(passport.session());

app.use(cors());
app.use(express.json());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    // res.redirect("/");
    const user: any = req.user;

    const token = jwt.sign({ id: user.id, email: user.email }, "secret");

    res.status(200).json({
      message: "Well done...!",
      data: token,
    });
  }
);

app.use("/api", auth);
const server = app.listen(process.env.PORT || port, () => {
  console.log();
  console.log("Auth Service connected...");
});

process.on("unhandledRejection", (error: Error) => {
  console.log("Error due to unhandledRejection");
  console.log(error);
  process.exit(1);
});
process.on("uncaughtException", (reason: any) => {
  console.log("Error due to uncaughtException");
  console.log(reason);
  server.close(() => {
    process.exit(1);
  });
});

consumeConnection("profiled");
consumeAbegConnection("beg");
