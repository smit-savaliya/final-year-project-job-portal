import express from "express"
import { getJobById, getJobs } from "../controller/jobController.js"

const jobRouter = express.Router()


//get all job data
jobRouter.get("/" , getJobs)

//get a single job data
jobRouter.get("/:id" , getJobById)


export default jobRouter