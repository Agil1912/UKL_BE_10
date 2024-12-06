import { Router } from "express";
import { registerUser, loginUser } from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/register", (req, res) => {
  registerUser(req, res);
});
authRouter.post("/login", (req, res) => {
  loginUser(req, res);
});

export default authRouter;
