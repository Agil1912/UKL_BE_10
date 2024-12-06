import express from "express";
import {
  createBorrow,
  getBorrows,
  returnItem,
} from "../controller/borrow.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";
import { getItem } from "../controller/item.controller";

const borrowRouter = express.Router();

borrowRouter.use((req, res, next) => {
  authMiddleware(req, res, next);
});
borrowRouter.use((req, res, next) => {
  const middleware = roleMiddleware(["USER"]);
  middleware(req, res, next);
});

borrowRouter.get("/:id", (req, res) => {
  getItem(req, res);
});
borrowRouter.post("/", (req, res) => {
  createBorrow(req, res);
});
borrowRouter.get("/", getBorrows);
borrowRouter.put("/return/:id", returnItem);

export default borrowRouter;
