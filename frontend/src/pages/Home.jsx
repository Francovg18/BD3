import React from 'react'
import NavBar from '../components/NavBar'
import Dashboard from '../components/Dashboard'
import Footer from '../components/Footer'
function Home() {
  return (
    <>
        <NavBar/>
        <div className='m-12'>
            <Dashboard/>
        </div>
        <Footer/>
    </>
  )
}

export default Home