import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import '../css/crud.css'; // Estilos para la interfaz CRUD

const AdminCrud = () => {
  const [votos, setVotos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [formData, setFormData] = useState({
    id_mesa: '',
    id_partido: '',
    total_votos: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const votosPerPage = 40; // Mostrar 40 votos por página
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener token de Firebase
        const user = auth.currentUser;
        if (!user) {
          navigate('/admin-login');
          return;
        }
        const token = await user.getIdToken();

        // Obtener votos
        const votosRes = await axios.get('http://localhost:5000/votos/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVotos(votosRes.data.data);

        // Obtener mesas
        const mesasRes = await axios.get('http://localhost:5000/mesas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMesas(mesasRes.data.data);

        // Obtener partidos
        const partidosRes = await axios.get('http://localhost:5000/partidos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPartidos(partidosRes.data.data);
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      }
    };
    fetchData();
  }, [navigate]);

  // Calcular índices para paginación
  const indexOfLastVoto = currentPage * votosPerPage;
  const indexOfFirstVoto = indexOfLastVoto - votosPerPage;
  const currentVotos = votos.slice(indexOfFirstVoto, indexOfLastVoto);
  const totalPages = Math.ceil(votos.length / votosPerPage);

  // Funciones para cambiar de página
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
      const url = editMode ? 'http://localhost:5000/votos/admin' : 'http://localhost:5000/votos/admin';
      const method = editMode ? 'put' : 'post';

      await axios({
        method,
        url,
        data: {
          id_mesa: formData.id_mesa,
          id_partido: formData.id_partido,
          total_votos: parseInt(formData.total_votos)
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(editMode ? 'Voto actualizado exitosamente' : 'Voto registrado exitosamente');
      setFormData({ id_mesa: '', id_partido: '', total_votos: '' });
      setEditMode(false);

      // Actualizar lista de votos
      const votosRes = await axios.get('http://localhost:5000/votos/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVotos(votosRes.data.data);
      setCurrentPage(1); // Volver a la primera página tras actualizar
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (voto) => {
    setFormData({
      id_mesa: voto.id_mesa,
      id_partido: voto.id_partido,
      total_votos: voto.total_votos
    });
    setEditMode(true);
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
      setCurrentPage(1); // Volver a la primera página tras eliminar
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="crud-container">
      <h2>Panel de Administración - CRUD Completo</h2>
      <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      <button onClick={() => navigate('/')} className="back-btn">Volver al Dashboard</button>

      <h3>{editMode ? 'Editar Voto' : 'Registrar Voto'}</h3>
      <form onSubmit={handleSubmit} className="crud-form">
        <select
          name="id_mesa"
          value={formData.id_mesa}
          onChange={handleInputChange}
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
        {editMode && <button type="button" onClick={() => { setEditMode(false); setFormData({ id_mesa: '', id_partido: '', total_votos: '' }); }}>Cancelar</button>}
      </form>
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
    </div>
  );
};

export default AdminCrud;