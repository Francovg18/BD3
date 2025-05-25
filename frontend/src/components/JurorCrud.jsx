import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import NavBar from './NavBar';
import Footer from './Footer';
import '../css/crud.css';

const JurorCrud = () => {
  const [partidos, setPartidos] = useState([]);
  const [newMesaData, setNewMesaData] = useState({
    departamento: '',
    municipio: '',
    recinto: '',
    votos: {}
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni'];
  const municipiosPorDepartamento = {
    La_Paz: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Cochabamba: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Santa_Cruz: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Oruro: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Potosí: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Chuquisaca: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Tarija: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Pando: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`),
    Beni: Array.from({ length: 20 }, (_, i) => `Municipio_${i + 1}`)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/juror-login');
          return;
        }
        const token = await user.getIdToken();
        const partidosRes = await axios.get('http://localhost:5000/partidos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPartidos(partidosRes.data.data);
        setNewMesaData(prev => ({
          ...prev,
          votos: partidosRes.data.data.reduce((acc, p) => ({ ...acc, [p.id_partido]: 0 }), {})
        }));
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchRecinto = async () => {
      if (newMesaData.departamento && newMesaData.municipio) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res = await axios.get(`http://localhost:5000/recintos?departamento=${newMesaData.departamento}&municipio=${newMesaData.municipio}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const recintos = res.data.data;
          const maxRecinto = recintos.length > 0
            ? Math.max(...recintos.map(r => parseInt(r.split('_')[1] || 0))) + 1
            : 1;
          setNewMesaData(prev => ({ ...prev, recinto: `Recinto_${maxRecinto}` }));
        } catch (err) {
          setError('Error al obtener recintos: ' + err.message);
        }
      }
    };
    fetchRecinto();
  }, [newMesaData.departamento, newMesaData.municipio]);

  const handleNewMesaInputChange = (e) => {
    const { name, value } = e.target;
    setNewMesaData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'departamento' ? { municipio: '', recinto: '' } : {}),
      ...(name === 'municipio' ? { recinto: '' } : {})
    }));
  };

  const handleVotoInputChange = (id_partido, value) => {
    setNewMesaData(prev => ({
      ...prev,
      votos: { ...prev.votos, [id_partido]: value }
    }));
  };

  const handleNewMesaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const res = await axios.post('http://localhost:5000/mesas?role=juror', {
        departamento: newMesaData.departamento,
        municipio: newMesaData.municipio,
        recinto: newMesaData.recinto,
        votos: newMesaData.votos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Mesa creada exitosamente. ID: ' + res.data.id_mesa);
      navigate('/'); // Redirigir al dashboard tras éxito
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <>
      <NavBar />
      <div className="crud-container">
        <h2>Panel de Jurado - Registrar Mesa</h2>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        <button onClick={() => navigate('/')} className="back-btn">Volver al Dashboard</button>

        <h3>Registrar Nueva Mesa</h3>
        <form onSubmit={handleNewMesaSubmit} className="crud-form new-mesa-form">
          <div className="form-group">
            <label htmlFor="departamento">Departamento</label>
            <select
              id="departamento"
              name="departamento"
              value={newMesaData.departamento}
              onChange={handleNewMesaInputChange}
              required
            >
              <option value="">Selecciona un departamento</option>
              {departamentos.map(dep => (
                <option key={dep} value={dep}>{dep.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="municipio">Municipio</label>
            <select
              id="municipio"
              name="municipio"
              value={newMesaData.municipio}
              onChange={handleNewMesaInputChange}
              required
              disabled={!newMesaData.departamento}
            >
              <option value="">Selecciona un municipio</option>
              {newMesaData.departamento && municipiosPorDepartamento[newMesaData.departamento].map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="recinto">Recinto</label>
            <input
              id="recinto"
              name="recinto"
              value={newMesaData.recinto}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="votos-section">
            <h4>Votos por Partido</h4>
            {partidos.map(partido => (
              <div key={partido.id_partido} className="voto-input">
                <label htmlFor={`voto-${partido.id_partido}`}>
                  {partido.nombre} ({partido.sigla})
                </label>
                <input
                  id={`voto-${partido.id_partido}`}
                  type="number"
                  value={newMesaData.votos[partido.id_partido] || 0}
                  onChange={(e) => handleVotoInputChange(partido.id_partido, e.target.value)}
                  min="0"
                  required
                />
              </div>
            ))}
          </div>
          <button type="submit">Registrar Mesa</button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
      <Footer />
    </>
  );
};

export default JurorCrud;