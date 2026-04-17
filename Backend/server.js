import express from 'express';
import 'dotenv/config';
import ConnectDb from './Database/db.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/ProductRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://e-commerce-xi-seven-84.vercel.app",
        "https://e-commerce-git-main-rahul-prajapatis-projects-f953a45a.vercel.app",
        "https://e-commerce-4fe8q3odd-rahul-prajapatis-projects-f953a45a.vercel.app"        
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'E-commerce Backend is running 🚀'
    });
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);

console.log("✅ All routes mounted successfully");

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Route not found" 
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
    await ConnectDb();
});
