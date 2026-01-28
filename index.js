import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/lib/db.js';
import userRouter from './src/routes/authRouter.js';


// Load variables
dotenv.config();
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;


app.use('/uploads', express.static('uploads'));

// Middleware
app.use(express.json()); // Allows parsing JSON body
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);       // Allows frontend access
app.use(express.urlencoded({ extended: true })); // Allows parsing URL-encoded body


// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api/auth', userRouter)

// Start Server
// const startServer = async () => {
//     try {
//         await connectDB();
//         app.listen(PORT, () => {
//             console.log(`Server running on http://localhost:${PORT}`);
//         });
//     } catch (error) {
//         console.log("Database connection failed", error);
//     }
// };

// startServer();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});