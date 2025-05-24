import React from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JurorLogin from './components/JurorLogin';
import AdminLogin from './components/AdminLogin';
import Home from './pages/Home';
import AdminCrud from './components/AdminCrud';
import JurorCrud from './components/JurorCrud';
import Departament from './pages/Departament';
import Candidatos from './pages/Candidatos';
function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/juror-login" element={<JurorLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-crud" element={<AdminCrud />} />
        <Route path="/juror-crud" element={<JurorCrud />} />
        <Route path="/" element={<Home />} />
        <Route path="/departament" element={<Departament />} />
        <Route path="/candidatos" element={<Candidatos />} />
      </Routes>
      </Router>
    </>
     
  )
}

export default App