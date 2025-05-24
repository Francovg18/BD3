import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Franja de colores de la bandera */}
      <div className="h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
      
      {/* Contenido principal del footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                <div className="w-8 h-2 bg-red-600"></div>
                <div className="w-8 h-2 bg-yellow-500"></div>
                <div className="w-8 h-2 bg-green-600"></div>
              </div>
              <h2 className="text-xl font-bold text-white">Elecciones Bolivia 2025</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Portal oficial informativo para el proceso electoral de Bolivia 2025. 
              Información confiable y actualizada para todos los ciudadanos.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/resultados" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Resultados electorales
                </a>
              </li>
              <li>
                <a href="/candidatos" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Candidatos y partidos
                </a>
              </li>
              <li>
                <a href="/proceso" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Proceso electoral
                </a>
              </li>
              <li>
                <a href="/recintos" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Recintos de votación
                </a>
              </li>
              <li>
                <a href="/calendario" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Calendario electoral
                </a>
              </li>
              <li>
                <a href="/preguntas" className="text-gray-300 hover:text-yellow-500 transition flex items-center">
                  <ChevronRight size={16} className="mr-1" /> Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>
          
          {/* Información de contacto */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-yellow-500 mr-2 mt-1" />
                <span className="text-gray-300">
                  Av. Fantasma N° 123, La Paz
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-yellow-500 mr-2" />
                <span className="text-gray-300">(591-2) 123789</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-yellow-500 mr-2" />
                <a href="mailto:info@eleccionesbolivia2025.gob.bo" className="text-gray-300 hover:text-yellow-500 transition">
                  info@eleccionesbolivia2025.gob.bo
                </a>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="text-yellow-500 mr-2 mt-1" />
                <span className="text-gray-300">
                  Lunes a Viernes: 8:30 - 16:30<br />
                  Sábados: 9:00 - 12:00
                </span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Mantente informado</h3>
            <p className="text-gray-300 text-sm mb-4">
              Suscríbete a nuestro boletín para recibir actualizaciones sobre el proceso electoral.
            </p>
            <form className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 text-white font-medium py-2 px-4 rounded-md hover:opacity-90 transition"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Enlaces legales y derechos */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Elecciones Bolivia 2025. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/terminos" className="text-gray-400 hover:text-yellow-500 transition">
              Términos y condiciones
            </a>
            <a href="/privacidad" className="text-gray-400 hover:text-yellow-500 transition">
              Política de privacidad
            </a>
            <a href="/accesibilidad" className="text-gray-400 hover:text-yellow-500 transition">
              Accesibilidad
            </a>
            <a href="/transparencia" className="text-gray-400 hover:text-yellow-500 transition">
              Transparencia
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}