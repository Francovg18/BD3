import React from 'react'
import NavBar from '../components/NavBar'
import Map from '../components/Map'
import Footer from '../components/Footer'
function Home() {
  return (
    <>
        <NavBar/>
        <div className='m-12'>
            <Map/>
        </div>
        <Footer/>
    </>
  )
}

export default Home