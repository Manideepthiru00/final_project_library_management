import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { connectDatabase } from "./database/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import borrowRouter from "./routes/borrowRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import reportRouter from "./routes/reportRoutes.js";

const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: process.env.FRONTEND_URL || true, // Uses environment variable or echoes origin for dev
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Basic request logger for backend terminal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

connectDatabase();

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/borrows", borrowRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);

app.use(errorMiddleware);

export default app;
