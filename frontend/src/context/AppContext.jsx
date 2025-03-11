import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";

export const AppContex = createContext(null)

const AppContextProvider = (props) => {

    const [searchFilter , setSearchFilter]= useState({
        title:"",
        location:""
    })

    const [isSearched , setIsSearched] = useState(false)

    const [jobs , setJobs] = useState([])

    const [showRecruiterLogin , setShowRecruiterLogin] = useState(false)

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
        showRecruiterLogin, setShowRecruiterLogin
    }

    return (<AppContex.Provider value={value}>
        {props.children}
    </AppContex.Provider>)
}

export default AppContextProvider

