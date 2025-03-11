import mongoose from "mongoose"
import "dotenv/config"

const url = process.env.MONGODB_URL

mongoose.connect(url)

const db = mongoose.connection 

db.on("connected", ()=>{
    console.log("Mongo db connected...")
})

db.on("error", (e)=>{
    console.log("mongoDB connection error " , e)
})

db.on("disconnected", ()=>{
    console.log("mondodb server disconneted..")
})

export {db}
