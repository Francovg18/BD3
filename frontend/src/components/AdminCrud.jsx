import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import NavBar from './NavBar';
import Footer from './Footer';
import '../css/crud.css';

const AdminCrud = () => {
  const [votos, setVotos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [editFormData, setEditFormData] = useState({
    id_mesa: '',
    id_partido: '',
    total_votos: ''
  });
  const [newMesaData, setNewMesaData] = useState({
    departamento: '',
    municipio: '',
    recinto: '',
    votos: {}
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const votosPerPage = 40;
  const navigate = useNavigate();
  const editFormRef = useRef(null); // Ref para la sección del formulario de edición
  const topRef = useRef(null); // Ref para el inicio de la página

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
          navigate('/admin-login');
          return;
        }
        const token = await user.getIdToken();

        const [votosRes, mesasRes, partidosRes] = await Promise.all([
          axios.get('http://localhost:5000/votos/admin', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/mesas', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/partidos', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setVotos(votosRes.data.data);
        setMesas(mesasRes.data.data);
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

  const indexOfLastVoto = currentPage * votosPerPage;
  const indexOfFirstVoto = indexOfLastVoto - votosPerPage;
  const currentVotos = votos.slice(indexOfFirstVoto, indexOfLastVoto);
  const totalPages = Math.ceil(votos.length / votosPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

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

  const handleEdit = (voto) => {
    setEditFormData({
      id_mesa: voto.id_mesa,
      id_partido: voto.id_partido,
      total_votos: voto.total_votos
    });
    setEditMode(true);
    // Desplazarse al formulario de edición
    if (editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await axios.put('http://localhost:5000/votos/admin', {
        id_mesa: editFormData.id_mesa,
        id_partido: editFormData.id_partido,
        total_votos: parseInt(editFormData.total_votos)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Voto actualizado exitosamente');
      setEditFormData({ id_mesa: '', id_partido: '', total_votos: '' });
      setEditMode(false);
      const votosRes = await axios.get('http://localhost:5000/votos/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVotos(votosRes.data.data);
      setCurrentPage(1);
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNewMesaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await axios.post('http://localhost:5000/mesas?role=admin', {
        departamento: newMesaData.departamento,
        municipio: newMesaData.municipio,
        recinto: newMesaData.recinto,
        votos: newMesaData.votos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Mesa creada exitosamente');
      setNewMesaData({
        departamento: '',
        municipio: '',
        recinto: '',
        votos: partidos.reduce((acc, p) => ({ ...acc, [p.id_partido]: 0 }), {})
      });
      const [votosRes, mesasRes] = await Promise.all([
        axios.get('http://localhost:5000/votos/admin', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/mesas', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setVotos(votosRes.data.data);
      setMesas(mesasRes.data.data);
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleDelete = async (id_mesa, id_partido) => {
    if (!window.confirm('¿Estás seguro de eliminar este voto?')) return;
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await axios.delete(`http://localhost:5000/votos/admin?id_mesa=${id_mesa}&id_partido=${id_partido}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Voto eliminado exitosamente');
      const votosRes = await axios.get('http://localhost:5000/votos/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVotos(votosRes.data.data);
      setCurrentPage(1);
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data?.error || err.message));
      // Desplazarse al inicio de la página
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
        <div ref={topRef}></div> {/* Punto de referencia para el inicio de la página */}
        <h2>Panel de Administración</h2>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        <button onClick={() => navigate('/')} className="back-btn">Volver al Dashboard</button>

        {/* Mostrar mensajes en la parte superior */}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <h3>Lista de Votos (Página {currentPage} de {totalPages})</h3>
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente
          </button>
        </div>
        <table className="crud-table">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Partido</th>
              <th>Votos</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentVotos.map((voto) => {
              const mesa = mesas.find(m => m.id_mesa === voto.id_mesa);
              return (
                <tr key={`${voto.id_mesa}-${voto.id_partido}`}>
                  <td>
                    {mesa
                      ? `${mesa.departamento} - ${mesa.municipio} - ${mesa.recinto}`
                      : voto.id_mesa}
                  </td>
                  <td>{partidos.find(p => p.id_partido === voto.id_partido)?.nombre || voto.id_partido}</td>
                  <td>{voto.total_votos}</td>
                  <td>{new Date(voto.fecha_hora).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleEdit(voto)}>Editar</button>
                    <button onClick={() => handleDelete(voto.id_mesa, voto.id_partido)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente
          </button>
        </div>

        {editMode && (
          <div ref={editFormRef}> {/* Punto de referencia para el formulario de edición */}
            <h3>Editar Voto</h3>
            <form onSubmit={handleEditSubmit} className="crud-form">
              <select
                name="id_mesa"
                value={editFormData.id_mesa}
                onChange={handleEditInputChange}
                required
              >
                <option value="">Selecciona una mesa</option>
                {mesas.map((mesa) => (
                  <option key={mesa.id_mesa} value={mesa.id_mesa}>
                    {mesa.departamento} - {mesa.municipio} - {mesa.recinto}
                  </option>
                ))}
              </select>
              <select
                name="id_partido"
                value={editFormData.id_partido}
                onChange={handleEditInputChange}
                required
              >
                <option value="">Selecciona un partido</option>
                {partidos.map((partido) => (
                  <option key={partido.id_partido} value={partido.id_partido}>
                    {partido.nombre} ({partido.sigla})
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="total_votos"
                value={editFormData.total_votos}
                onChange={handleEditInputChange}
                placeholder="Total de votos"
                min="0"
                required
              />
              <button type="submit">Actualizar</button>
              <button type="button" onClick={() => { setEditMode(false); setEditFormData({ id_mesa: '', id_partido: '', total_votos: '' }); }}>
                Cancelar
              </button>
            </form>
          </div>
        )}

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
      </div>
      <Footer />
    </>
  );
};

export default AdminCrud;