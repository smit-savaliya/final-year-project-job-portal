import Company from "../models/Company.js"
import bcrypt from  "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import generateToken from "../utils/generateToken.js"
import Job from "../models/Job.js"


//register a new company
const registerCompany  =  async (req , res) => {
        const {name , email , password} = req.body

        const imageFile = req.file
        if(!name || !email || !password || !imageFile){
            return res.json({success:false , message:"Missing details"})
        }

        try {
            const companyExits = await Company.findOne({email})
            if(companyExits){
                return res.json({success:false , message:"Company already register."})
            }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password , salt)

            const imageUpload = await cloudinary.uploader.upload(imageFile.path)

            const company = await Company.create({
                name , 
                email ,
                password:hashPassword,
                image:imageUpload.secure_url
            })

            res.json({
                success:true ,
                company:{
                    _id:company._id,
                    name:company.name,
                    email:company.email,
                    image:company.image
                },

                token:generateToken(company._id)
            })




        } catch (error) {
                res.json({success:false , message:error.message})
        }


}

//company login
const loginCompany = async (req , res)=>{
    const {email , password } = req.body
    try {
        const company = await Company.findOne({email})

        if(bcrypt.compare(password , company.password)){
            res.json({
                success:true , 
                company:{
                    _id:company._id,
                    name:company.name,
                    email:company.email,
                    image:company.image
                },
                token:generateToken(company._id)
            })
        }else{
            res.json({success:false , message:"Invalid  Email or Password"})
        }
    } catch (error) {
            res.json({success:false , message:error.message})
    }
}

//get company data
const companyData = async (req , res)=>{
    
    try {
            const company = req.company
            res.json({success:true, company})
        } catch (error) {
            res.json({success:false , message:error.message})
        }
}

//post a new job
const postJob = async (req , res)=>{
        const {title , description , location, salary, level , category} = req.body

        const companyId = req.company._id

        try {
            const newJob = new Job({
                title , 
                description,
                location,
                salary,
                companyId,
                date:Date.now(),
                level,
                category

            })

            await newJob.save()
            res.json({success:true , newJob})
        } catch (error) {
            res.json({success:false , message:error.message})
        }


        
}

//get company job applicants
const getCompanyJobApplicants = async(req , res)=>{

}

//get company posted job
const getCompanyPostedJobs = async(req,res)=>{

}

//chaneg job Application status
const ChangeJobApplicationStatus = async(req,res)=>{

}

const changeVisibility = async (req,res)=>{

}

export {registerCompany,loginCompany , companyData, postJob , getCompanyJobApplicants , getCompanyPostedJobs , ChangeJobApplicationStatus, changeVisibility}

