import Job from "../models/Job.js"
import JobApplication from "../models/jobApplication.js"
import User from "../models/User.js"
import {v2 as cloudinary} from "cloudinary"

// get user data
const getUserData = async (req , res)=>{

        const userId = req.auth.userId 

        try {
            const user = await User.findById(userId)
            if(!user){
                return res.json({success:false , message:"User not Found!"})
            }

            res.json({success:true , user})

        } catch (error) {
            res.json({success:false , message:error.message})
        }
}


//apply for job
const applyForJob = async (req , res) => {

        const {jobId} = req.body 
        const userId = req.auth.userId

        try {
            const isAlreadyApplied = await JobApplication.find({jobId , userId})
            if(isAlreadyApplied.length > 0){
                return res.json({success:false , message:"Already Applied."})
            }

            const jobData = await Job.findById(jobId)
            if(!jobData){
                return res.json({success:false , message:"Job not Found!"})
            }

            await JobApplication.create({
                companyId:jobData.companyId,
                userId,
                jobId,
                date:Date.now()
            })

            return res.json({success:true , message:"Applied successfully"})

        } catch (error) {
            res.json({success:false , message:error.message})
        }

}

//get user applied applications
const getUserJobApplications = async(req , res) => {

    try {
        
        const userId = req.auth.userId
        const applications = (await JobApplication.find({userId})).
        populate("companyId", "name email image")
        .populate("jobId" , "title description location category level salary")
        .exec()

        if(!applications){
            return res.json({success:false , message:"No job application found for this user."})
        }

        return res.josn({success:true , applications})

    } catch (error) {
        res.json({success:false , message:error.message})
    }

}

//update user profile(Resume)
const updateUserResume = async (req , ress) => {
        try {
            
            const userId = req.auth.userId 
            const resumeFile = req.resumeFile 
            const userData = await User.findById(userId) 

            if(resumeFile){
                const resumeUpload = await  cloudinary.uploader.upload(resumeFile.path)
                userData.resume = resumeUpload.secure_url
            }

            await userData.save()

            return res.json({success:true , message:"Resume Updated."})
        } catch (error) {
            res.json({message:false , message:error.message})
        }
}

export {getUserData , applyForJob , getUserJobApplications , updateUserResume}