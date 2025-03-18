import { createContext, useEffect, useReducer, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContex = createContext(null)

const AppContextProvider = (props) => {

    const backendurl =  import.meta.env.VITE_BACKEND_URL 
    // const backendurl = import.meta.env.BACKEND_URL
    console.log("backend url:", { backendurl });
    const   {user} = useUser()
    const {getToken}= useAuth()

    const [searchFilter , setSearchFilter]= useState({
        title:"",
        location:""
    })

    const [isSearched , setIsSearched] = useState(false)

    const [jobs , setJobs] = useState([])

    const [showRecruiterLogin , setShowRecruiterLogin] = useState(false)

    const [companyToken , setCompanyToken] = useState(null)
    const [companyData , setCompanyData] = useState(null)

    const [userData , setUserData] = useState(null)
    const [userApplications , setUserApplications] = useState([])


    //fetch the job data
    const fetchJobs = async ()=>{
        try {
            
            const {data} = await axios.get(backendurl+"/api/jobs")
            if(data.success){
                setJobs(data.jobs)
                console.log(data.jobs)
            }else{
                toast.error(data.message )
            }

        } catch (error) {
            toast.error(error.message)
        }
        // setJobs(jobsData)
    }

    //fetch the company data
    const fetchCompanyData = async () => {
        try {
            const {data} = await axios.get(backendurl + "/api/company/company" ,  {headers:{token:companyToken}})
            if(data.success){
                setCompanyData(data.company)
                console.log(data)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
        toast.error(error.message)
        }
    }

    //fetch user data
    const fetchUserData = async () => {
        try {
            const token = await getToken()
            const {data} = await axios.get(backendurl+"/api/users/user" , {
                headers:{Authorization:`Bearer ${token}`}
            })

            if(data.success){
                setUserData(data.user)

            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(data.message)
        }
    }

    //fetch user's applied applications data
    const fetchUserApplications = async () => {
        try {
            
            const token = await getToken()
            const {data} = await axios.get(backendurl+"/api/users/application", 
                {headers:{Authorization:`Bearer ${token}`}}
            )
            if(data.success){
                setUserApplications(data.applications)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchJobs()

        const storedCompanyToken = localStorage.getItem("companyToken")
        if(storedCompanyToken){
            setCompanyToken(storedCompanyToken)
        }
    }, [])

    useEffect(()=>{
        if(companyToken){
            fetchCompanyData()
        }
    },[companyToken])

    useEffect(()=>{

        if(user){
            fetchUserData()
            fetchUserApplications()
        }

    }, [user])


    const value={

        searchFilter,
        setSearchFilter,
        isSearched,
        setIsSearched,
        jobs , setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken , setCompanyToken,
        companyData , setCompanyData,
        backendurl,
        userData , setUserData , 
        userApplications , setUserApplications,
        fetchUserData, fetchUserApplications
    }
    

    return (<AppContex.Provider value={value}>
        {props.children}
    </AppContex.Provider>)
}

export default AppContextProvider

