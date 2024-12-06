import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getBorrows = async (req: Request, res: Response) => {
  try {
    const borrows = await prisma.borrow.findMany({
      where: { userId: (req as any).user.userId }, // assuming the user is authenticated and userId is stored in the token
    });
    res.status(200).json({
      status: "Success",
      message: "Retrieved user's borrows successfully",
      data: borrows,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBorrow = async (req: Request, res: Response) => {
  const { userId, itemId, borrowDate, returnDate } = req.body;

  try {
    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);

    if (borrowDateObj >= returnDateObj) {
      return res
        .status(400)
        .json({ message: "Return date must be after borrow date" });
    }

    const existingBorrows = await prisma.borrow.findMany({
      where: {
        itemId,
        OR: [
          {
            borrowDate: {
              lte: returnDateObj, // Existing borrow with borrowDate before or on returnDate
            },
            returnDate: {
              gte: borrowDateObj, // Existing borrow with returnDate after or on borrowDate
            },
          },
          {
            borrowDate: {
              gte: borrowDateObj, // Existing borrow with borrowDate after or on new borrowDate
            },
            returnDate: {
              lte: returnDateObj, // Existing borrow with returnDate before or on new returnDate
            },
          },
        ],
      },
    });

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { quantity: true },
    });

    if (!item)
      return res.status(400).json({
        message: "Item is not found",
      });

    if (existingBorrows.length === item.quantity) {
      return res.status(400).json({
        message: "This item is already borrowed during the specified period",
      });
    }

    const borrow = await prisma.borrow.create({
      data: {
        userId,
        itemId,
        borrowDate: borrowDateObj,
        returnDate: returnDateObj,
      },
    });

    res.status(201).json({
      status: "Success",
      message: "Borrowed an item successfully",
      data: borrow,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const returnItem = async (req: Request, res: Response) => {
  const borrowId = req.params.id; // Ambil ID dari parameter URL
  const { returnDate } = req.body;

  try {
    // Cari record borrow berdasarkan ID
    const borrow = await prisma.borrow.update({
      where: { id: borrowId },
      data: {
        actualReturnDate: new Date(returnDate), // Konversi returnDate menjadi Date
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Returned an item successfully",
      data: borrow,
    });
  } catch (error) {
    // Perbaiki tipe error dengan mengasumsikan bahwa ini adalah instance Error
    const e = error as Error; // Konversi ke tipe Error

    console.error("Error while returning item:", e.message); // Akses properti message dari error
    res
      .status(500)
      .json({ message: "Internal server error", error: e.message });
  }
};
