import React from 'react'
import NavBar from '../components/NavBar'
import LiveResultsByRegion from '../components/LiveResultsByRegion'
import Footer from '../components/Footer'
function Home() {
  return (
    <>
        <NavBar/>
        <div className='m-12'>
            <LiveResultsByRegion/>
        </div>
        <Footer/>
    </>
  )
}

export default Home