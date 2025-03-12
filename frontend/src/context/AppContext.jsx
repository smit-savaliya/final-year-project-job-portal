import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";

export const AppContex = createContext(null)

const AppContextProvider = (props) => {

    const backendurl = "http://localhost/5050"

    const [searchFilter , setSearchFilter]= useState({
        title:"",
        location:""
    })

    const [isSearched , setIsSearched] = useState(false)

    const [jobs , setJobs] = useState([])

    const [showRecruiterLogin , setShowRecruiterLogin] = useState(false)

    const [companyToken , setCompanyToken] = useState(null)
    const [companyData , setCompanyData] = useState(null)


    //fetch the job data
    const fetchJobs = async ()=>{
        setJobs(jobsData)
    }

    useEffect(()=>{
        fetchJobs()
    }, [])


    const value={

        searchFilter,
        setSearchFilter,
        isSearched,
        setIsSearched,
        jobs , setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken , setCompanyToken,
        companyData , setCompanyData,
        backendurl
    }
    console.log("AppContext providing:", { showRecruiterLogin, backendurl });

    return (<AppContex.Provider value={value}>
        {props.children}
    </AppContex.Provider>)
}

export default AppContextProvider

