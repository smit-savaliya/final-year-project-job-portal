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
import {GoogleGenerativeAI} from "@google/generative-ai"


const app = express()

await connectCloudinary()


//middleware
app.use(cors({ origin: "http://localhost:5173"}))
app.use(express.json())
app.use(clerkMiddleware())



//routes
app.get("/", (req,res)=>{
    res.send("Api working")
})
app.post("/webhooks", clerkwebhooks)

app.use("/api/company" , companyRouter)

app.use("/api/jobs" , jobRouter)

app.use("/api/users" , userRouter)

//chatbot endpoint
app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message } = req.body;
  
      if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }
  
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      // System prompt to make the bot a job assistant
      const prompt = `You are a helpful job assistant for a job portal. Answer the user's query: ${message}`;
      const response = await model.generateContent(prompt);
      const botResponse = response.response.text();
  
      res.json({ success: true, response: botResponse });
    } catch (error) {
      console.error("Gemini API error:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });




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