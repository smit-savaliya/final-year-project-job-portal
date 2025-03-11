import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ApplyJob from './pages/ApplyJob.jsx'
import Application from './pages/Application.jsx'
import RecruiterLogin from './components/RecruiterLogin.jsx'
import { AppContex } from './context/AppContext.jsx'
import Dashboard from "./pages/Dashboard.jsx"
import ManageJobs from "./pages/ManageJobs.jsx"
import AddJob from './pages/AddJob.jsx'
import ViewApplication from './pages/ViewApplication.jsx'
import "quill/dist/quill.snow.css"

function App() {

  const { showRecruiterLogin } = useContext(AppContex)
  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />}></Route>
        <Route path='/applications' element={<Application />}></Route>

        <Route path='/dashboard' element={<Dashboard />}>
          <Route path='add-job' element={<AddJob />} />
          <Route path='manage-job' element={<ManageJobs />} />
          <Route path='view-application' element={<ViewApplication />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
