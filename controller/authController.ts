import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  resetAccountPasswordMail,
  sendFirstEmail,
  sendSecondEmail,
} from "../utils/email";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const tokenValue = crypto.randomBytes(2).toString("hex");
    const secretKey = crypto.randomBytes(2).toString("hex");
    const token = jwt.sign(tokenValue, "token");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const account = await prisma.crowdAuth.create({
      data: {
        email,
        password: hashed,
        secretKey,
        token,

        profile: [],
        abeg: [],
      },
    });

    sendFirstEmail(account).then(() => {
      console.log("Mail Sent...");
    });

    return res.status(201).json({
      message: "Your Account has been created successfully",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
      data: error,
    });
  }
};

export const allAccount = async (req: Request, res: Response) => {
  try {
    const account = await prisma.crowdAuth.findMany({});

    return res.status(200).json({
      message: "Viewing all Account",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
      data: error,
    });
  }
};

export const getSingleAccount = async (req: Request, res: Response) => {
  try {
    const { accountID } = req.params;

    const account = await prisma.crowdAuth.findUnique({
      where: { id: accountID },
    });

    return res.status(200).json({
      message: "Viewing single Account",
      data: account,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
      data: error,
    });
  }
};

export const firstAccountVerification = async (req: Request, res: Response) => {
  try {
    const { secretKey } = req.body;
    const { token } = req.params;

    jwt.verify(token, "secret", async (error, payload: any) => {
      if (error) {
        throw new Error();
      } else {
        const account = await prisma.crowdAuth.findUnique({
          where: { id: payload.id },
        });

        if (account?.secretKey === secretKey) {
          sendSecondEmail(account).then(() => {
            console.log("Mail Sent...");
          });

          return res.status(200).json({
            message: "PLease to verify your Account",
          });
        } else {
          return res.status(404).json({
            message: "Error with your Token",
          });
        }
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
    });
  }
};

export const accountVerification = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    jwt.verify(token, "secret", async (error, payload: any) => {
      if (error) {
        throw new Error();
      } else {
        const account = await prisma.crowdAuth.findUnique({
          where: { id: payload.id },
        });

        if (account) {
          await prisma.crowdAuth.update({
            where: { id: payload.id },
            data: {
              token: "",
              verify: true,
            },
          });

          return res.status(200).json({
            message: "Congratulation your account has been Verifify!!!",
          });
        } else {
          return res.status(404).json({
            message: "Error with your Token",
          });
        }
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error",
    });
  }
};

export const SignInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.crowdAuth.findUnique({
      where: { email },
    });

    if (user) {
      const check = await bcrypt.compare(password, user.password);

      if (check) {
        if (user.verify && user.token === "") {
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
            },
            "secret",
            { expiresIn: "3d" }
          );

          return res.status(201).json({
            message: `Welcome back ${user.email}`,
            user: token,
          });
        } else {
          return res.status(404).json({
            message: "Please go and verify your account",
          });
        }
      } else {
        return res.status(404).json({
          message: "check your password",
        });
      }
    } else {
      return res.status(404).json({
        message: "cannot find user",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error signing in",
    });
  }
};

export const resetAccountPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.crowdAuth.findUnique({
      where: { email },
    });

    if (user?.verify && user.token === "") {
      const token = jwt.sign({ id: user.id }, "secret");

      await prisma.crowdAuth.update({
        where: { id: user.id },
        data: {
          token,
        },
      });

      resetAccountPasswordMail(user, token).then(() => {
        console.log("message Sent...!");
      });
      console.log("4: ", email);

      return res.status(201).json({
        message: "You can now change your Password",
      });
    } else {
      return res.status(404).json({
        message: "can't reset this password",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error reseting password",
      data: error,
    });
  }
};

export const changeAccountPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const getID: any = jwt.verify(token, "secret", (err, payload: any) => {
      if (err) {
        return err;
      } else {
        return payload.id;
      }
    });

    const user = await prisma.crowdAuth.findUnique({
      where: { id: getID },
    });

    if (user?.verify && user.token !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      await prisma.crowdAuth.update({
        where: { id: user.id },
        data: {
          password: hashed,
        },
      });

      return res.status(201).json({
        message: "Your password has been changed",
      });
    } else {
      return res.status(404).json({
        message: "can't change this password",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error changing password",
      data: error,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const Delete = await prisma.crowdAuth.delete({
      where: { id: userID },
    });
    return res.status(201).json({
      message: `${Delete.email} your account has been deleted`,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error deleting Account",
      data: error,
    });
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const { accountID } = req.params;
    const update = await prisma.crowdAuth.update({
      where: { id: accountID },
      data: {
        profile: req.body,
      },
    });

    return res.status(201).json({
      message: "updated",
      data: update,
    });
  } catch (error) {
    return res.status(404).json({
      message: "error updatng",
      data: error,
    });
  }
};
