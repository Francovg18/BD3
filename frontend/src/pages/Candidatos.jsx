import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, Star, MapPin, Calendar, Award, Eye, Heart } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import {candidatos} from '../data/candidatos';

export default function Candidatos() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const toggleFavorite = (index) => {
    setFavorites(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const sortedCandidatos = [...candidatos].sort((a, b) => b.popularidad - a.popularidad);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-100"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-700 backdrop-blur-md border border-white/20 mb-6">
              <Calendar className="w-4 h-4 mr-2 text-green-300" />
              <span className="text-sm font-medium text-white">Elecciones 2025</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gray-900 mb-6">
              Candidatos Presidenciales
            </h1>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto leading-relaxed">
              Conoce a los candidatos que aspiran a liderar Bolivia hacia el futuro. 
              Explora sus propuestas, trayectorias y visiones para el país.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Users className="w-5 h-5 mr-2" />
                Vista {viewMode === 'grid' ? 'Lista' : 'Tarjetas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {sortedCandidatos.map((candidato, index) => (
            <div
              key={index}
              className={`group relative transform transition-all duration-500 hover:scale-105 ${
                hoveredCard === index ? 'z-10' : ''
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card */}
              <div className="relative bg-gray-800 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25">
                {/* Ranking Badge */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  #{index + 1}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(index)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.includes(index) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-white/70 hover:text-red-400'
                    }`} 
                  />
                </button>

                {/* Profile Image */}
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${candidato.color} rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <img
                    src={candidato.imagen}
                    alt={candidato.nombre}
                    className="relative w-full h-full object-cover rounded-full border-4 border-white/30 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{candidato.nombre}</h2>
                  <p className="text-blue-300 font-medium mb-3">{candidato.partido}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{candidato.descripcion}</p>
                </div>

                {/* Popularity Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Popularidad</span>
                    <span className="text-sm font-bold text-white">{candidato.popularidad}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${candidato.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${candidato.popularidad}%` }}
                    ></div>
                  </div>
                </div>

                {/* Proposals Preview */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    Propuestas Principales
                  </h3>
                  <ul className="space-y-2">
                    {candidato.propuestas.slice(0, 2).map((propuesta, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <ChevronRight className="w-4 h-4 mr-2 text-blue-400 mt-0.5 flex-shrink-0" />
                        {propuesta}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCandidate(candidato)}
                    className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${candidato.color} text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <img
                  src={selectedCandidate.imagen}
                  alt={selectedCandidate.nombre}
                  className="w-16 h-16 object-cover rounded-full border-4 border-white/30 mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCandidate.nombre}</h2>
                  <p className="text-blue-300">{selectedCandidate.partido}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">{selectedCandidate.descripcion}</p>
            
            <h3 className="text-xl font-bold text-white mb-4">Todas las Propuestas:</h3>
            <ul className="space-y-3">
              {selectedCandidate.propuestas.map((propuesta, idx) => (
                <li key={idx} className="text-gray-300 flex items-start">
                  <ChevronRight className="w-5 h-5 mr-3 text-blue-400 mt-0.5 flex-shrink-0" />
                  {propuesta}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
      <Footer/>
    </>
  );
}