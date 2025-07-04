import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Development origins
    const devOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    if (devOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Production origin from environment variable
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Vercel deployments
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test route to verify server starts
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!", 
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Import routes
import { connectDB } from "./config/db.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userProgressRouter from "./routes/userProgressRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import compilerRoutes from "./routes/compilerRoutes.js";
import xpRoutes from './routes/xpRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Static files
app.use(
  "/CoreJava_Images",
  express.static("backend/markdown-content/CoreJava/CoreJava_Images")
);

// Routes
app.use("/api/exercises", exerciseRoutes);
app.use("/api/courses", courseRouter);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user-progress", userProgressRouter);
app.use("/api/certificate", paymentRouter);
app.use("/api/certification", certificationRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Connect to DB and start server
const initializeServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server initialization failed:", error.message);
    process.exit(1);
  }
};

initializeServer();