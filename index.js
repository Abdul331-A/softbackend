import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/lib/db.js';
import userRouter from './src/routes/authRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';
// import { isIPv4 } from 'net';



// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load variables
dotenv.config();
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '192.168.220.5';


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});