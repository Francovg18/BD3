import Edimg from '../assets/ec.jpg';
import arimg from '../assets/ar.jpg';
import evaimg from '../assets/eva.jpg';
import tqimg from '../assets/jt.jpg';
import dmimg from '../assets/sdjpg.jpg'
import jdimg from '../assets/jd.jpg'
export const candidatos = [
  {
    nombre: 'Eduardo del Castillo',
    partido: 'Movimiento al Socialismo (MAS)',
    imagen: Edimg,
    descripcion: 'Exministro de Gobierno, respaldado por el presidente Luis Arce.',
    propuestas: [
      'Fortalecimiento de la seguridad ciudadana.',
      'Impulso a la industrialización del litio.',
      'Mejoras en el sistema de salud pública.',
    ],
    color: 'from-blue-600 to-purple-700',
    popularidad: 85,
  },
  {
    nombre: 'Samuel Doria Medina',
    partido: 'Unidad Nacional (UN)',
    imagen: dmimg,
    descripcion: 'Empresario y político con experiencia en el sector privado.',
    propuestas: [
      'Fomento a la inversión extranjera.',
      'Reforma educativa integral.',
      'Desarrollo de infraestructura vial.',
    ],
    color: 'from-emerald-500 to-teal-600',
    popularidad: 72,
  },
  {
    nombre: 'Manfred Reyes Villa',
    partido: 'Autonomía Para Bolivia-Súmate',
    imagen: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Exalcalde de Cochabamba y líder regional.',
    propuestas: [
      'Descentralización administrativa.',
      'Apoyo a las pequeñas y medianas empresas.',
      'Mejoras en el transporte público.',
    ],
    color: 'from-orange-500 to-red-600',
    popularidad: 68,
  },
  {
    nombre: 'Jorge "Tuto" Quiroga',
    partido: 'Alianza Libre',
    imagen: tqimg,
    descripcion: 'Expresidente de Bolivia con amplia trayectoria política.',
    propuestas: [
      'Lucha contra la corrupción.',
      'Promoción de energías renovables.',
      'Fortalecimiento de las instituciones democráticas.',
    ],
    color: 'from-indigo-600 to-blue-700',
    popularidad: 79,
  },
  {
    nombre: 'Eva Copa',
    partido: 'Movimiento de Renovación Nacional (Morena)',
    imagen: evaimg,
    descripcion: 'Exsenadora y líder joven con enfoque en inclusión social.',
    propuestas: [
      'Empoderamiento de mujeres y jóvenes.',
      'Acceso universal a la educación.',
      'Protección del medio ambiente.',
    ],
    color: 'from-pink-500 to-rose-600',
    popularidad: 74,
  },
  {
    nombre: 'Andrónico Rodríguez',
    partido: 'Alianza Popular',
    imagen: arimg,
    descripcion: 'Presidente del Senado y figura emergente del MAS.',
    propuestas: [
      'Reforma agraria sostenible.',
      'Defensa de los derechos indígenas.',
      'Transparencia en la gestión pública.',
    ],
    color: 'from-green-600 to-emerald-700',
    popularidad: 71,
  },
  {
    nombre: 'Jaime Dunn',
    partido: 'Nueva Generación Patriótica',
    imagen: jdimg,
    descripcion: 'Analista financiero con propuestas innovadoras.',
    propuestas: [
      'Modernización del sistema financiero.',
      'Impulso a la economía digital.',
      'Educación financiera para todos.',
    ],
    color: 'from-cyan-500 to-blue-600',
    popularidad: 63,
  },
  {
    nombre: 'Rodrigo Paz',
    partido: 'Partido Demócrata Cristiano (PDC)',
    imagen: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop&crop=face',
    descripcion: 'Exalcalde de Tarija con enfoque en desarrollo regional.',
    propuestas: [
      'Desarrollo sostenible del sur del país.',
      'Fortalecimiento de la autonomía regional.',
      'Promoción del turismo cultural.',
    ],
    color: 'from-violet-600 to-purple-700',
    popularidad: 66,
  },
];