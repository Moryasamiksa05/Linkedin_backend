import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";

import { connectDB } from "./lib/db.js";

//  Load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get correct __dirname in ES modules
const __dirname = path.resolve();

//  Log the frontend URL for debugging
console.log("Allowed Frontend URL:", process.env.CLIENT_URL);

//Allow only specified domains
const allowedOrigins = [
  "http://localhost:5173",
  "https://linkedin-frontend-7qvq.vercel.app",
].filter(Boolean); // Removes undefined

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin); // Debug
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);




//  Middleware setup
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendPath));
}

  //Catch-all route for React (skip API requests)
  app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).end(); // Don't serve index.html for API routes
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});


//  Start the server
app.listen(PORT, async () => {
  await connectDB();
  console.log(` Server running on port ${PORT}`);
});
