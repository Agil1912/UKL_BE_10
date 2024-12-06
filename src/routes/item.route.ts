import express from "express";
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "../controller/item.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";

const itemRouter = express.Router();

itemRouter.use((req, res, next) => {
  authMiddleware(req, res, next);
});
itemRouter.use((req, res, next) => {
  const middleware = roleMiddleware(["ADMIN"]);
  middleware(req, res, next);
});

itemRouter.post("/", createItem);
itemRouter.get("/", getItems);
itemRouter.put("/:id", updateItem);
itemRouter.delete("/:id", deleteItem);

export default itemRouter;
