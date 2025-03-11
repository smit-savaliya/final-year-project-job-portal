import express from "express"
import { ChangeJobApplicationStatus, changeVisibility, companyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from "../controller/companyController.js"
import upload from "../config/multer.js"
import { protectCompany } from "../middleware/authMiddleware.js"

const companyRouter = express.Router()

//Register a company
companyRouter.post("/register", upload.single("image"),registerCompany)

//company login
companyRouter.post("/login", loginCompany)

//get company data
companyRouter.get("/company", protectCompany,companyData)

//post a job
companyRouter.post("/post-job",protectCompany,postJob)

//get applicants data of company
companyRouter.get("/applicants", protectCompany,getCompanyJobApplicants)

//get company job list
companyRouter.get("/list-jobs",protectCompany,getCompanyPostedJobs)

//change apllication status
companyRouter.post("/change-status", protectCompany,ChangeJobApplicationStatus)

//change application visibility
companyRouter.post("/change-visibility", protectCompany,changeVisibility)

export default companyRouter