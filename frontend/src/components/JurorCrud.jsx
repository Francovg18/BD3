import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import '../css/crud.css'; // Estilos compartidos con AdminCrud

const JurorCrud = () => {
  const [votos, setVotos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [mesaAsignada, setMesaAsignada] = useState(null);
  const [formData, setFormData] = useState({
    id_partido: '',
    total_votos: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/juror-login');
          return;
        }
        const token = await user.getIdToken();

        // Obtener mesa asignada (simulada: usar email para derivar id_mesa)
        const email = user.email;
        const id_mesa = email.split('@')[0]; // Simulación: derivar id_mesa del email
        const mesaRes = await axios.get(`http://localhost:5000/mesas?id_mesa=${id_mesa}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mesaRes.data.data.length === 0) {
          setError('No tienes una mesa asignada');
          return;
        }
        setMesaAsignada(mesaRes.data.data[0]);

        // Obtener votos de la mesa asignada
        const votosRes = await axios.get(`http://localhost:5000/votos/jurado?id_mesa=${id_mesa}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVotos(votosRes.data.data);

        // Obtener partidos
        const partidosRes = await axios.get('http://localhost:5000/partidos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPartidos(partidosRes.data.data);
      } catch (err) {
        setError('Error al cargar datos: ' + (err.response?.data?.error || err.message));
      }
    };
    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const url = 'http://localhost:5000/votos/jurado';
      const method = editMode ? 'put' : 'post';

      await axios({
        method,
        url: `${url}?id_mesa=${mesaAsignada.id_mesa}`,
        data: {
          id_partido: formData.id_partido,
          total_votos: parseInt(formData.total_votos)
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(editMode ? 'Voto actualizado exitosamente' : 'Voto registrado exitosamente');
      setFormData({ id_partido: '', total_votos: '' });
      setEditMode(false);

      // Actualizar lista de votos
      const votosRes = await axios.get(`http://localhost:5000/votos/jurado?id_mesa=${mesaAsignada.id_mesa}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVotos(votosRes.data.data);
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (voto) => {
    setFormData({
      id_partido: voto.id_partido,
      total_votos: voto.total_votos
    });
    setEditMode(true);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (!mesaAsignada) {
    return (
      <div className="crud-container">
        <h2>Panel de Jurado Electoral</h2>
        <p className="error">{error}</p>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        <button onClick={() => navigate('/')} className="back-btn">Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="crud-container">
      <h2>Panel de Jurado - Mesa {mesaAsignada.nro_mesa} ({mesaAsignada.departamento})</h2>
      <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      <button onClick={() => navigate('/')} className="back-btn">Volver al Dashboard</button>

      <h3>{editMode ? 'Editar Voto' : 'Registrar Voto'}</h3>
      <form onSubmit={handleSubmit} className="crud-form">
        <select
          name="id_partido"
          value={formData.id_partido}
          onChange={handleInputChange}
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
          value={formData.total_votos}
          onChange={handleInputChange}
          placeholder="Total de votos"
          min="0"
          required
        />
        <button type="submit">{editMode ? 'Actualizar' : 'Registrar'}</button>
        {editMode && <button type="button" onClick={() => { setEditMode(false); setFormData({ id_partido: '', total_votos: '' }); }}>Cancelar</button>}
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <h3>Votos Registrados en Mesa {mesaAsignada.nro_mesa}</h3>
      <table className="crud-table">
        <thead>
          <tr>
            <th>Partido</th>
            <th>Votos</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {votos.map((voto) => (
            <tr key={`${voto.id_mesa}-${voto.id_partido}`}>
              <td>{partidos.find(p => p.id_partido === voto.id_partido)?.nombre || voto.id_partido}</td>
              <td>{voto.total_votos}</td>
              <td>{new Date(voto.fecha_hora).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(voto)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JurorCrud;