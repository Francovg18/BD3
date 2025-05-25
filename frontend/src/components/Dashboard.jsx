import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import '../css/dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Coordenadas aproximadas de los departamentos de Bolivia
const departamentosCoordenadas = {
  La_Paz: { lat: -16.5, lng: -68.15 },
  Cochabamba: { lat: -17.39, lng: -66.15 },
  Santa_Cruz: { lat: -17.8, lng: -63.18 },
  Oruro: { lat: -17.97, lng: -67.12 },
  Potosí: { lat: -19.58, lng: -65.75 },
  Chuquisaca: { lat: -19.03, lng: -65.26 },
  Tarija: { lat: -21.53, lng: -64.73 },
  Pando: { lat: -11.02, lng: -68.77 },
  Beni: { lat: -14.83, lng: -64.9 }
};

// Mapa de colores fijos por sigla de partido
const coloresPorPartido = {
  'MAS': { background: 'rgba(0, 8, 255, 0.8)', border: 'rgba(0, 8, 255, 1)' },
  'NGP': { background: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' },
  'SUMATE': { background: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)' },
  'ADN': { background: 'rgba(255, 0, 0, 0.8)', border: 'rgba(0, 0, 0, 1)' },
  'UN': { background: 'rgba(228, 222, 44, 0.8)', border: 'rgba(54, 162, 235, 1)' },
  'LIBRE': { background: 'rgba(40, 94, 243, 0.8)', border: 'rgba(243, 40, 40, 1)' },
  'PDC': { background: 'rgba(75, 192, 92, 0.8)', border: 'rgba(243, 40, 40, 1)' },
  'NA': { background: 'rgba(213, 213, 213, 0.8)', border: 'rgba(133, 133, 133, 1)' },
  'MORENA': { background: 'rgba(66, 63, 0, 0.8)', border: 'rgba(145, 39, 39, 1)' },
  'UCS': { background: 'rgba(0, 255, 255, 0.8)', border: 'rgba(0, 255, 255, 1)' }
};

export default function Dashboard() {
  const [datos, setDatos] = useState([]);
  const [votosPorDepartamento, setVotosPorDepartamento] = useState([]);
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const departamentos = ['todos', 'La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = filtroDepartamento === 'todos'
          ? 'http://localhost:5000/votos'
          : `http://localhost:5000/votos?departamento=${filtroDepartamento}`;
        const res = await axios.get(url);
        setDatos(res.data.data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setLoading(false);
      }
    };

    const fetchVotosPorDepartamento = async () => {
      try {
        const res = await axios.get('http://localhost:5000/votos_por_departamento');
        setVotosPorDepartamento(res.data.data);
      } catch (err) {
        console.error('Error al obtener votos por departamento:', err);
      }
    };

    fetchData();
    fetchVotosPorDepartamento();
    const intervalo = setInterval(() => {
      fetchData();
      fetchVotosPorDepartamento();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [filtroDepartamento]);

  const totalVotos = datos.reduce((sum, partido) => sum + partido.votos, 0);

  const data = {
    labels: datos.map(d => d.nombre),
    datasets: [
      {
        label: 'Votos',
        data: datos.map(d => d.votos),
        backgroundColor: datos.map(d => coloresPorPartido[d.sigla]?.background || 'rgba(128, 128, 128, 0.8)'),
        borderColor: datos.map(d => coloresPorPartido[d.sigla]?.border || 'rgba(128, 128, 128, 1)'),
        borderWidth: 2,
        borderRadius: 8,
        maxBarThickness: 80,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Distribución de Votos por Partido',
        font: {
          size: 18,
          family: "'Poppins', sans-serif",
          weight: 'bold'
        },
        padding: {
          bottom: 20
        },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 16,
          family: "'Poppins', sans-serif",
        },
        bodyFont: {
          size: 14,
          family: "'Poppins', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const partido = datos[index];
            const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
            return `${partido.votos.toLocaleString()} votos (${porcentaje}%)`;
          },
          title: function(context) {
            const index = context[0].dataIndex;
            const partido = datos[index];
            return `${partido.nombre} (${partido.sigla})`;
          }
        }
      },
      datalabels: {
        color: '#fff', // Mantiene el color del texto blanco
        font: {
          weight: 'bold',
          family: "'Poppins', sans-serif",
          size: 14
        },
        textShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)',
        textStrokeColor: '#000', // Color del borde negro
        textStrokeWidth: 2, // Ancho del borde en píxeles
        formatter: function (value, context) {
          const porcentaje = ((value / totalVotos) * 100).toFixed(1);
          return `${porcentaje}%`;
        },
        anchor: 'center',
        align: 'center',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        border: {
          dash: [4, 4]
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          },
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // Fecha última actualización
  const formatFecha = (fecha) => {
    const opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return fecha.toLocaleTimeString('es-ES', opciones);
  };

  return (
    <div className="dashboard-container mt-12">
      <div className="dashboard-header">
        <h2>Elecciones Presidenciales</h2>
        <p>Monitoreo de resultados en tiempo real</p>
      </div>

      {/* Filtro por departamento */}
      <div className="filtro-container">
        <label htmlFor="departamento">Filtrar por Departamento: </label>
        <select
          id="departamento"
          onChange={(e) => setFiltroDepartamento(e.target.value)}
          value={filtroDepartamento}
        >
          {departamentos.map(dep => (
            <option key={dep} value={dep}>
              {dep === 'todos' ? 'Todos' : dep.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="summary-container">
        {datos.map((partido) => {
          const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
          return (
            <div
              key={partido.sigla}
              className="summary-card"
              style={{ borderTop: `4px solid ${coloresPorPartido[partido.sigla]?.border || 'rgba(128, 128, 128, 1)'}` }}
            >
              <h3>{partido.sigla}</h3>
              <div className="value">{partido.votos.toLocaleString()}</div>
              <div className="percentage">{porcentaje}%</div>
            </div>
          );
        })}
      </div>

      {/* Gráfica */}
      <div className="chart-container" style={{ height: '400px' }}>
        {loading && datos.length === 0 ? (
          <div className="loading">Cargando datos...</div>
        ) : datos.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="no-data">No hay datos disponibles</div>
        )}
      </div>

      {/* Mapa de Bolivia */}
      {/* <div className="map-container" style={{ height: '400px', marginTop: '20px' }}>
        <h3>Partido Ganador por Departamento</h3>
        {loading && votosPorDepartamento.length === 0 ? (
          <div className="loading">Cargando mapa...</div>
        ) : votosPorDepartamento.length > 0 ? (
          <MapContainer center={[-16.5, -68.15]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {votosPorDepartamento.map((dep, index) => (
              <Marker key={index} position={[departamentosCoordenadas[dep.departamento].lat, departamentosCoordenadas[dep.departamento].lng]}>
                <Popup>
                  <b>{dep.departamento.replace('_', ' ')}</b><br />
                  Ganador: {dep.partido_ganador} ({dep.sigla})<br />
                  Porcentaje: {dep.porcentaje}%
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="no-data">No hay datos de departamentos disponibles</div>
        )}
      </div> */}

      {/* Indicador de actualización */}
      <div className="update-status">
        <div className="update-indicator"></div>
        <span>Última actualización: {formatFecha(lastUpdated)}</span>
      </div>
    </div>
  );
}