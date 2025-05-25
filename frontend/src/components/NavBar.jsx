import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, User, LogIn, Home, Users, MapPin, Info, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  const navItems = [
    { id: 'candidatos', label: 'Candidatos', href: '/candidatos', icon: Users },
    { id: 'departamentos', label: 'Departamentos', href: '/departament', icon: MapPin },
  ];

  const infoItems = [
    { label: 'Proceso Electoral', target: '_blank', href: 'https://www.oep.org.bo/wp-content/uploads/2025/04/04-04-25-calendario-Electoral-EG-2025.pdf' },
    { label: 'Recintos de Votación', target: '_blank', href: 'https://yoparticipo.oep.org.bo/auth/signin' },
    { label: 'Preguntas Frecuentes', target: '_blank', href: 'https://www.oep.org.bo/elecciones-generales-2019/preguntas-frecuentes/' },
  ];

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50'
          : 'bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 shadow-2xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo Mejorado */}
        <Link to="/">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group-hover:scale-110 ${
                scrolled ? 'bg-white shadow-lg' : 'bg-white/90 shadow-xl'
              }`}
            >
              <div className="w-8 h-1.5 bg-red-600 rounded-full transform transition-all duration-300 group-hover:scale-110"></div>
              <div className="w-8 h-1.5 bg-yellow-500 rounded-full my-0.5 transform transition-all duration-300 group-hover:scale-110"></div>
              <div className="w-8 h-1.5 bg-green-600 rounded-full transform transition-all duration-300 group-hover:scale-110"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600/20 via-yellow-500/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                  scrolled ? 'text-gray-800' : 'text-white'
                } group-hover:scale-105`}
              >
                Elecciones Bolivia 2025
              </h1>
              <div
                className={`text-xs font-medium transition-all duration-300 ${
                  scrolled ? 'text-gray-500' : 'text-white/80'
                }`}
              >
                Democracia en Acción
              </div>
            </div>
          </div>
        </Link>

        {/* Enlaces principales (escritorio) */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={`relative flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  isActive
                    ? scrolled
                      ? 'bg-gradient-to-r from-red-600 to-green-600 text-white shadow-lg'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                    : scrolled
                      ? 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-green-50 hover:text-red-700'
                      : 'text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
              >
                <Icon
                  size={18}
                  className={`mr-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {item.label}
                {isActive && (
                  <div
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
                      scrolled ? 'bg-white' : 'bg-yellow-300'
                    } animate-pulse`}
                  ></div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/10 via-yellow-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            );
          })}

          {/* Dropdown Información */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                scrolled
                  ? 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                  : 'text-white hover:bg-white/10 backdrop-blur-sm'
              }`}
            >
              <Info size={18} className="mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              Información
              <ChevronDown
                size={16}
                className={`ml-1 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div
              className={`absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-200/50 transform transition-all duration-300 ${
                dropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="p-2">
                {infoItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    target={item.target || '_self'} // Usa '_self' como predeterminado
                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined} // Seguridad para nueva pestaña
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-green-50 hover:text-red-700 rounded-xl transition-all duration-300 group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-red-600 to-green-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3 ml-6">
            <a
              href="./juror-login"
              className={`flex items-center px-6 py-2.5 rounded-full font-medium transition-all duration-300 group ${
                scrolled
                  ? 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:scale-105 hover:shadow-lg'
                  : 'bg-white/90 text-red-600 hover:bg-white hover:scale-105 hover:shadow-xl backdrop-blur-sm'
              }`}
            >
              <LogIn size={18} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
              Jurado
            </a>
            <a
              href="/admin-login"
              className={`flex items-center px-6 py-2.5 rounded-full font-medium transition-all duration-300 group ${
                scrolled
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-105 hover:shadow-lg'
                  : 'bg-white/90 text-green-600 hover:bg-white hover:scale-105 hover:shadow-xl backdrop-blur-sm'
              }`}
            >
              <User size={18} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
              Administrador
            </a>
          </div>
        </nav>

        {/* Botón menú móvil */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className={`p-2 rounded-xl transition-all duration-300 ${
              scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {menuAbierto ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable en móviles mejorado */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuAbierto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-lg px-6 py-6 shadow-2xl border-t-4 border-gradient-to-r from-red-600 via-yellow-500 to-green-600">
          <div className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMenuAbierto(false);
                  }}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-green-50 hover:text-red-700'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </a>
              );
            })}

            <div className="py-3">
              <div className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-3 flex items-center">
                <Info size={14} className="mr-2" />
                Información
              </div>
              <div className="space-y-2 pl-4">
                {infoItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    target={item.target || '_self'} // Usa '_self' como predeterminado
                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined} // Seguridad para nueva pestaña
                    className="flex items-center text-gray-700 py-2 hover:text-red-600 transition-colors duration-300"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-red-600 to-green-600 rounded-full mr-3"></div>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <button className="w-full flex items-center justify-center px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300">
                <LogIn size={18} className="mr-2" /> Jurado
              </button>
              <button className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300">
                <User size={18} className="mr-2" /> Administrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}