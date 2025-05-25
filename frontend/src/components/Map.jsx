import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import axios from 'axios';
import '../css/map.css';
import boliviaGeoJSON from '../data/bolivia-departments.json';

// Mapa de colores fijos por sigla de partido
const coloresPorPartido = {
  'MAS': { background: 'rgba(0, 8, 255, 0.8)', border: 'rgba(0, 8, 255, 1)' },
  'NGP': { background: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' },
  'SUMATE': { background: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)' },
  'ADN': { background: 'rgba(255, 0, 0, 0.8)', border: 'rgba(0, 0, 0, 1)' },
  'UN': { background: 'rgba(228, 222, 44, 0.8)', border: 'rgba(54, 162, 235, 1)' },
  'LIBRE': { background: 'rgba(40, 128, 243, 0.8)', border: 'rgba(243, 40, 40, 1)' },
  'PDC': { background: 'rgba(75, 192, 92, 0.8)', border: 'rgba(243, 40, 40, 1)' },
  'NA': { background: 'rgba(213, 213, 213, 0.8)', border: 'rgba(133, 133, 133, 1)' },
  'MORENA': { background: 'rgba(66, 63, 0, 0.8)', border: 'rgba(145, 39, 39, 1)' },
  'UCS': { background: 'rgba(0, 255, 255, 0.8)', border: 'rgba(0, 255, 255, 1)' }
};

const Map = () => {
  const [votosPorDepartamento, setVotosPorDepartamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotosPorDepartamento = async () => {
      try {
        const res = await axios.get('http://localhost:5000/votos_por_departamento');
        console.log('Datos de votosPorDepartamento:', res.data.data); // Debug log
        setVotosPorDepartamento(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener votos por departamento:', err);
        setLoading(false);
      }
    };

    fetchVotosPorDepartamento();
  }, []);

  // Normalizar nombres de departamentos (manejar espacios y mayúsculas/minúsculas)
  const normalizeDepartmentName = (name) => {
    if (!name) return '';
    return name.replace(/\s+/g, '_').toLowerCase();
  };

  // Mapear departamentos a colores según partido ganador
  const getDepartmentColor = (departmentName) => {
    const normalizedName = normalizeDepartmentName(departmentName);
    const depData = votosPorDepartamento.find(dep => 
      normalizeDepartmentName(dep.departamento) === normalizedName
    );
    if (depData && coloresPorPartido[depData.sigla]) {
      return coloresPorPartido[depData.sigla].background;
    }
    console.log(`No se encontró color para ${departmentName} (normalizado: ${normalizedName})`); // Debug log
    return 'rgba(128, 128, 128, 0.8)'; // Default color
  };

  // Mapear departamentos a nombres de partidos ganadores
  const getPartyName = (departmentName) => {
    const normalizedName = normalizeDepartmentName(departmentName);
    const depData = votosPorDepartamento.find(dep => 
      normalizeDepartmentName(dep.departamento) === normalizedName
    );
    return depData ? `${depData.partido_ganador} (${depData.sigla})` : 'Sin datos';
  };

  // Mapear departamentos a porcentajes
  const getPercentage = (departmentName) => {
    const normalizedName = normalizeDepartmentName(departmentName);
    const depData = votosPorDepartamento.find(dep => 
      normalizeDepartmentName(dep.departamento) === normalizedName
    );
    return depData ? `${depData.porcentaje}%` : 'N/A';
  };

  return (
    <div className="map-page-container container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mapa Electoral de Bolivia</h2>
      <p className="mb-4">Partido ganador por departamento</p>

      {loading ? (
        <div className="text-center">Cargando mapa...</div>
      ) : (
        <div className="map-container bg-white shadow-lg rounded-lg p-4">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000, // Increased scale to zoom in
              center: [-63.5, -16.5] // Adjusted center to fit Bolivia better
            }}
            width={600} // Adjusted width to match Bolivia's aspect ratio
            height={250} // Increased height to accommodate Bolivia's vertical span
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies geography={boliviaGeoJSON}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getDepartmentColor(geo.properties.NOM_DEP)}
                    stroke="#000"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: 'default' },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={() => {}}
                    onMouseLeave={() => {}}
                    onClick={() => {}}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>

          {/* Legend */}
          <div className="legend mt-4">
            <h3 className="text-lg font-semibold">Leyenda</h3>
            <ul className="grid grid-cols-2 gap-2">
              {votosPorDepartamento.map(dep => (
                <li key={dep.departamento} className="flex items-center">
                  <span
                    className="w-4 h-4 mr-2 inline-block"
                    style={{ backgroundColor: coloresPorPartido[dep.sigla]?.background || 'rgba(128, 128, 128, 0.8)' }}
                  ></span>
                  {dep.partido_ganador} ({dep.sigla}) - {dep.departamento.replace('_', ' ')}
                </li>
              ))}
            </ul>
          </div>

          {/* Department Table */}
          <div className="department-table mt-4">
            <h3 className="text-lg font-semibold">Resultados por Departamento</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Departamento</th>
                  <th className="border p-2">Partido Ganador</th>
                  <th className="border p-2">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {votosPorDepartamento.map(dep => (
                  <tr key={dep.departamento}>
                    <td className="border p-2">{dep.departamento.replace('_', ' ')}</td>
                    <td className="border p-2">{dep.partido_ganador} ({dep.sigla})</td>
                    <td className="border p-2">{dep.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Volver al Dashboard
      </button>
    </div>
  );
};

export default Map;