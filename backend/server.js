import express from "express"
import cors from  "cors"
import "dotenv/config"
import { db } from "./config/db.js"
import { clerkwebhooks } from "./controller/webhooks.js"
import companyRouter from "./routes/companyRoutes.js"
import connectCloudinary from "./config/cloudinary.js"
import jobRouter from "./routes/jobRoutes.js"
import userRouter from "./routes/userRoutes.js"
import {clerkMiddleware} from "@clerk/express"

const app = express()

await connectCloudinary()


//middleware
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())



//routes
app.get("/", (req,res)=>{
    res.send("Api working")
})
app.post("/webhooks", clerkwebhooks)

app.use("/api/company" , companyRouter)

app.use("/api/jobs" , jobRouter)

app.use("/api/users" , userRouter)

app.use(clerkMiddleware())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


const PORT = process.env.PORT || 5000

app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`)
})