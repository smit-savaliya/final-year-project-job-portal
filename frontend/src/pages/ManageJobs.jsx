import React, { useContext, useEffect, useState } from 'react'
import { manageJobsData } from '../assets/assets'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContex } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ManageJobs = () => {

  const navigate = useNavigate()

  const [jobs , setJobs] = useState([])

  const {backendurl , companyToken} = useContext(AppContex)

  //function to fetch company job applicatoins data 
  const fetchCompanyJobs = async () => {

        try {
          const {data} = await axios.get(backendurl+"/api/company/list-jobs" , {headers:{token:companyToken}})

          if(data.success){
            setJobs(data.jobsData.reverse())
            console.log(data.jobsData)
          }else{
            toast.error(data.message)
            console.log(data.error)
          }

        } catch (error) {
          toast.error(error.message)
        }

  }

  //function to change job visibility
  const changeJobVisibility = async (id)=>{
      try {

        const {data} = await axios.post(backendurl+"/api/company/change-visibility",
          {id},
          {headers:{token:companyToken}}
        
         )

         if(data.success){
          toast.success(data.message)
          fetchCompanyJobs()
         }else{
          toast.error(data.message)
         }
        
      } catch (error) {
          toast.error(error.message)
      }
  }

  useEffect(()=>{
      fetchCompanyJobs()
  } , [companyToken])

   return (
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
              <th className='py-2 px-4 border-b text-left'>Job title </th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location </th>
              <th className='py-2 px-4 border-b text-left'>Applicants </th>
              <th className='py-2 px-4 border-b text-left'>Visible </th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job,index)=>(
              <tr key={index} className='text-gray-700 '>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{index+1}</td>
                  <td className='py-2 px-4 border-b'>{job.title}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format("ll")}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                  <td className='py-2 px-4 border-b text-center'>{job.applicants}</td>
                  <td className='py-2 px-4 border-b'>
                    <input onChange={()=> changeJobVisibility(job._id)} className='scale-125 ml-4' type="checkbox" checked={job.visible} />
                  </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='mt-4 flex justify-end'>
          <button onClick={()=> navigate("/dashboard/add-job")} className='bg-black text-white py-2 px-4 rounded'>Add New Job</button>
        </div>
      </div>
    </div>
  )
}

export default ManageJobs
