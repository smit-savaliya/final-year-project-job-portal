import express from "express"
import cors from  "cors"
import "dotenv/config"
import { db } from "./config/db.js"
import { clerkwebhooks } from "./controller/webhooks.js"

const app = express()

//middleware
app.use(cors())
app.use(express.json())

//routes
app.get("/", (req,res)=>{
    res.send("Api working")
})
app.post("/webhooks", clerkwebhooks)

const PORT = process.env.PORT || 5000

app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`)
})