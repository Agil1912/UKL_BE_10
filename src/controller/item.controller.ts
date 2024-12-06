import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createItem = async (req: Request, res: Response) => {
  const { name, category, location, quantity } = req.body;
  try {
    const item = await prisma.item.create({
      data: { name, category, location, quantity },
    });
    res.status(201).json({
      status: "Success",
      message: "Created an item successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

export const getItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json({
      status: "Success",
      message: "Retrieved items successfully",
      items,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

export const getItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({ where: { id } });
    res.status(200).json({
      status: "Success",
      message: "Retrieved items successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, location, quantity } = req.body;
  try {
    const item = await prisma.item.update({
      where: { id },
      data: { name, category, location, quantity },
    });

    res.status(200).json({
      status: "Success",
      message: "Updated an item successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.item.delete({ where: { id } });
    res
      .status(204)
      .json({ status: "Success", message: "Deleted an item successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
