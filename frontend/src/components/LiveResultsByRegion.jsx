import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

const departamentos = [
  'La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí',
  'Chuquisaca', 'Tarija', 'Pando', 'Beni'
];

export default function LiveResultsByRegion() {
  const [departamento, setDepartamento] = useState('La_Paz');
  const [datos, setDatos] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async (dep) => {
    try {
      const res = await axios.get(`http://localhost:5000/votos?departamento=${dep}`);
      setDatos(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error al obtener datos:", err);
    }
  };

  useEffect(() => {
    fetchData(departamento);
    const interval = setInterval(() => fetchData(departamento), 5000);
    return () => clearInterval(interval);
  }, [departamento]);

  const totalVotos = datos.reduce((sum, p) => sum + p.votos, 0);

  const data = {
    labels: datos.map(d => d.nombre),
    datasets: [
      {
        label: 'Votos',
        data: datos.map(d => d.votos),
        backgroundColor: [
          '#60a5fa', '#facc15', '#34d399', '#f87171',
          '#a78bfa', '#fbbf24', '#38bdf8', '#f472b6'
        ],
        borderRadius: 8
      }
    ]
  };

  const options = {
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 13 },
        formatter: (value) => `${((value / totalVotos) * 100).toFixed(1)}%`
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const votos = context.raw;
            const porcentaje = ((votos / totalVotos) * 100).toFixed(2);
            return `${votos.toLocaleString()} votos (${porcentaje}%)`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const formatFecha = (fecha) => {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto text-center">
      {/* Banner informativo */}
      <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-md mb-6 text-left">
        🕐 Las elecciones están en curso. Los resultados se actualizan cada 5 segundos y son de carácter provisional.
      </div>

      {/* Título */}
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Elecciones por Departamento</h2>
      <p className="text-slate-500 mb-6">Monitoreo filtrado por región</p>

      {/* Selector */}
      <div className="mb-8 flex justify-center gap-4 items-center">
        <label htmlFor="departamento" className="text-sm font-medium text-slate-700">
          Selecciona un departamento:
        </label>
        <select
          id="departamento"
          className="p-2 border border-slate-300 rounded-lg shadow-sm text-slate-800"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        >
          {departamentos.map(dep => (
            <option key={dep} value={dep}>{dep.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Cards de resumen */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {datos.map((partido, index) => {
          const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
          return (
            <div key={index} className="bg-white shadow-md rounded-xl p-4 border-t-4 border-blue-400">
              <h3 className="text-slate-700 font-semibold">{partido.sigla}</h3>
              <p className="text-2xl font-bold text-slate-900">{partido.votos.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{porcentaje}%</p>
            </div>
          );
        })}
      </div>

      {/* Gráfica */}
      <div className="bg-white p-4 shadow-lg rounded-xl mb-6">
        <Bar data={data} options={options} />
      </div>

      {/* Última actualización */}
      <p className="text-sm text-slate-500">
        Última actualización: <span className="font-medium">{formatFecha(lastUpdated)}</span>
      </p>

      {/* Botón para volver */}
      <div className="mt-6">
        <a
          href="/"
          className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition"
        >
          ← Volver al resumen nacional
        </a>
      </div>

      {/* Pie de página */}
      <div className="mt-10 text-xs text-slate-400">
        Estos resultados son informativos. Para resultados oficiales, consulta el sitio del TSE.
      </div>
    </div>
  );
}
