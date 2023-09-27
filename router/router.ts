import express from "express";
import {
  SignInUser,
  accountVerification,
  allAccount,
  changeAccountPassword,
  createAccount,
  deleteUser,
  firstAccountVerification,
  getSingleAccount,
  resetAccountPassword,
} from "../controller/authController";

const router = express.Router();

router.route("/create-account").post(createAccount);
router.route("/all-account").get(allAccount);

router.route("/:accountID/single-account").get(getSingleAccount);
(firstAccountVerification);

router.route("/:token/verify-account").get(accountVerification);
router.route("/sign-in-account").post(SignInUser);


router.route("/:userID/delete").delete(deleteUser);

router.route("/reset-account-password").patch(resetAccountPassword);


router.route("/:token/change-account-password").patch(changeAccountPassword);

router.route("/:token/verify-account").get(accountVerification);




export default router;
