import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Efecto para detectar scroll y cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Función para manejar la navegación y cerrar el menú móvil
  const handleNavigation = (path) => {
    navigate(path);
    setMenuAbierto(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
            <div className="w-8 h-2 bg-red-600"></div>
            <div className="w-8 h-2 bg-yellow-500"></div>
            <div className="w-8 h-2 bg-green-600"></div>
          </div>
          <h1
            className={`text-xl sm:text-2xl font-bold ${
              scrolled ? 'text-gray-800' : 'text-white'
            }`}
          >
            Elecciones Bolivia 2025
          </h1>
        </div>

        {/* Enlaces principales (escritorio) */}
        <nav className="hidden md:flex items-center">
          <div className="flex space-x-6 mr-6">
            <button
              onClick={() => handleNavigation('/')}
              className={`font-medium hover:text-red-800 transition cursor-pointer ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavigation('/resultados')}
              className={`font-medium hover:text-red-800 transition cursor-pointer ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Resultados
            </button>
            <button
              onClick={() => handleNavigation('/candidatos')}
              className={`font-medium hover:text-red-800 transition cursor-pointer ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Candidatos
            </button>
            <div className="relative group">
              <button
                className={`flex items-center font-medium group-hover:text-red-800 transition cursor-pointer ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Información <ChevronDown size={16} className="ml-1" />
              </button>
              <div
                className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-1 py-2 w-48 -translate-y-1"
                style={{ paddingTop: '0.5rem' }} // Adds padding to close the gap
              >
                <button
                  onClick={() => handleNavigation('/proceso')}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                >
                  Proceso Electoral
                </button>
                <button
                  onClick={() => handleNavigation('/recintos')}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                >
                  Recintos de Votación
                </button>
                <button
                  onClick={() => handleNavigation('/preguntas')}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                >
                  Preguntas Frecuentes
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigation('/juror-login')}
              className={`flex items-center px-4 py-2 rounded-full transition-all cursor-pointer ${
                scrolled
                  ? 'border border-red-600 text-red-600 hover:bg-red-50'
                  : 'bg-white text-red-600 hover:bg-gray-100'
              }`}
            >
              <LogIn size={18} className="mr-2" /> Iniciar Sesión
            </button>
            <button
              onClick={() => handleNavigation('/admin-login')}
              className={`flex items-center px-4 py-2 rounded-full transition-all cursor-pointer ${
                scrolled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-green-600 hover:bg-gray-100'
              }`}
            >
              <User size={18} className="mr-2" /> Administrador
            </button>
          </div>
        </nav>

        {/* Botón menú móvil */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className={`cursor-pointer ${scrolled ? 'text-gray-800' : 'text-white'}`}
          >
            {menuAbierto ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable en móviles */}
      {menuAbierto && (
        <div className="md:hidden bg-white px-6 py-4 shadow-lg border-t-2 border-yellow-500">
          <div className="space-y-3">
            <button
              onClick={() => handleNavigation('/')}
              className="block text-gray-700 font-medium hover:text-red-600 w-full text-left cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavigation('/resultados')}
              className="block text-gray-700 font-medium hover:text-yellow-500 w-full text-left cursor-pointer"
            >
              Resultados
            </button>
            <button
              onClick={() => handleNavigation('/candidatos')}
              className="block text-gray-700 font-medium hover:text-green-600 w-full text-left cursor-pointer"
            >
              Candidatos
            </button>

            <div className="py-2">
              <div className="text-gray-500 uppercase text-xs font-semibold tracking-wider mb-2">
                Información
              </div>
              <button
                onClick={() => handleNavigation('/proceso')}
                className="block text-gray-700 pl-2 py-1 hover:text-yellow-500 w-full text-left cursor-pointer"
              >
                Proceso Electoral
              </button>
              <button
                onClick={() => handleNavigation('/recintos')}
                className="block text-gray-700 pl-2 py-1 hover:text-yellow-500 w-full text-left cursor-pointer"
              >
                Recintos de Votación
              </button>
              <button
                onClick={() => handleNavigation('/preguntas')}
                className="block text-gray-700 pl-2 py-1 hover:text-yellow-500 w-full text-left cursor-pointer"
              >
                Preguntas Frecuentes
              </button>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-3 mt-2">
              <button
                onClick={() => handleNavigation('/juror-login')}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-50 transition cursor-pointer"
              >
                <LogIn size={18} className="mr-2" /> Iniciar Sesión
              </button>
              <button
                onClick={() => handleNavigation('/admin-login')}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition cursor-pointer"
              >
                <User size={18} className="mr-2" /> Administrador
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}