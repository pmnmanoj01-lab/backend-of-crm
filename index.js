import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cookieParser from "cookie-parser";
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoute from './routes/adminRoute.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoute from './routes/authRoute.js';
import managerRoute from './routes/managerRoute.js';
import productRoute from './routes/productRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
// import cadProductRoute from './routes/cadProductRoutes.js';
import masterRoute from './routes/masterRoute.js';
const app = express();
const allowedOrigins = [
    "https://crm.bhunte.com/",  // Production
    "https://crm-six-blond.vercel.app/",  // Production
    "http://localhost:5173",
    "http://localhost:3000",              // Local dev
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps / Postman / server-to-server)
        if (!origin) return callback(null, true);

        // Allow Vercel preview deployments (*.vercel.app)
        if (origin.includes(".vercel.app")) {
            return callback(null, true);
        }
        if (origin.includes(".bhunte.com")) {
            return callback(null, true);
        }

        // Allow only the specified origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("❌ CORS Blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// Connect DB
connectDB();


// Routes
app.use('/admin', adminRoute);
app.use("/auth", authRoute)
app.use("/manager", managerRoute)
app.use("/product", productRoute)
app.use("/dashboard", dashboardRoute)
// app.use("/cad-designer", cadProductRoute)
app.use("/master", masterRoute)
app.get("/test", (_, res) => {
    res.send("server is running on port 5000")
})


// Error Handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
