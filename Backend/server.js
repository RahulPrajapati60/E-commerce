import express from 'express';
import 'dotenv/config'
import ConnectDb from './Database/db.js';
import userRoutes from './routes/userRoutes.js'
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

//middewere
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}))
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'E-commerce Backend is running 🚀' });
});
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/products", productRoutes);

console.log(" Product routes mounted at /api/v1/products");

app.use((req, res) => {
    console.log("❌ Route not found:", req.method, req.originalUrl);
    res.status(404).json({
        success: false,
        message: "Route not found",
        url: req.originalUrl
    });
});


app.listen(PORT, () => {
    ConnectDb()
    console.log(`Server is running port: ${PORT}`);

})
