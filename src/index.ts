import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import prisma from "./lib/prisma";
import authRouter from "./routes/auth.route";
import borrowRouter from "./routes/borrow.route";
import itemRouter from "./routes/item.route";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/item", itemRouter);
app.use("/api/borrow", borrowRouter);
app.get("/api/borrow-analysis", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const analysis = await prisma.borrow.groupBy({
      by: ["itemId"], // Group by itemId to count the number of borrows for each item
      where: {
        borrowDate: {
          gte: start, // Greater than or equal to the start date
          lte: end, // Less than or equal to the end date
        },
      },
      _count: {
        itemId: true,
      },
      orderBy: {
        _count: {
          itemId: "desc",
        },
      },
    });

    const items = await Promise.all(
      analysis.map(async (borrow) => {
        const item = await prisma.item.findUnique({
          where: { id: borrow.itemId },
        });
        return {
          itemId: borrow.itemId,
          itemName: item?.name,
          borrowCount: borrow._count.itemId,
        };
      })
    );

    res.json({
      status: "Success",
      message: "Successfully retrieved borrow analysis",
      period: { startDate, endDate },
      items,
    });
  } catch (error) {
    console.error("Error in borrow analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log("App is running on port", PORT);
});
