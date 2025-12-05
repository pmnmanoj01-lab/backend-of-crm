import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cookieParser from "cookie-parser";
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoute from './routes/adminRoute.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoute from './routes/authRoute.js';

const app = express();


// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://crm-six-blond.vercel.app/"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ CORS Blocked:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// Connect DB
connectDB();


// Routes
app.use('/admin', adminRoute);
app.use("/auth",authRoute)
app.get("/test",(_,res)=>{
 res.send("server is running on port 5000")
})


// Error Handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));