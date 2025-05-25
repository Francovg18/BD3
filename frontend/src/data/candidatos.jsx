import Edimg from '../assets/ec.jpg';
import arimg from '../assets/ar.jpg';
import evaimg from '../assets/eva.jpg';
import tqimg from '../assets/jt.jpg';
import dmimg from '../assets/sdjpg.jpg';
import jdimg from '../assets/jd.jpg';

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
    popularidad:65.76,
  },
  {
    nombre: 'Jhonny Fernández',
    partido: 'Alianza Fuerza del Pueblo (UCS)',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Jhonny_Fern%C3%A1ndez.jpg/250px-Jhonny_Fern%C3%A1ndez.jpg',
    descripcion: 'Alcalde de Santa Cruz de la Sierra y líder de Unidad Cívica Solidaridad (UCS). Encabeza la Alianza Fuerza del Pueblo.',
    propuestas: [
      'Promover el desarrollo económico regional mediante inversión en infraestructura en Santa Cruz.',
      'Fomentar la unidad entre sectores sociales y políticos para contrarrestar la fragmentación política.',
      'Mejorar la gobernanza local y los servicios municipales para elevar la calidad de vida.',
    ],
    color: 'from-pink-700 to-blue-700',
    popularidad: 37.18,
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
    popularidad: 62.96,
  },
  {
    nombre: 'Manfred Reyes Villa',
    partido: 'Autonomía Para Bolivia-Súmate',
    imagen: 'https://scontent.flpb1-1.fna.fbcdn.net/v/t39.30808-1/242841062_393827028779874_7516085281487730280_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=J8IuPqK8ha4Q7kNvwESi3PI&_nc_oc=AdkykA0ZVLapPW4j6FPRnuT9wNlJ8ir3rTiw5TownPPKMAKD4J89me2iiW2XUY3Bm0FDsPyNoHB_Bb_S2LbCNXjM&_nc_zt=24&_nc_ht=scontent.flpb1-1.fna&_nc_gid=4KzDQdqsa2W41CrhVojiLg&oh=00_AfJ8FuLd8O5sMTOEA4I6OdMbkgVe-f06tjgvw4LLqpF3HA&oe=6838A2B0',
    descripcion: 'Exalcalde de Cochabamba y líder regional.',
    propuestas: [
      'Descentralización administrativa.',
      'Apoyo a las pequeñas y medianas empresas.',
      'Mejoras en el transporte público.',
    ],
    color: 'from-orange-500 to-red-600',
    popularidad: 65.29,
  },
  {
    nombre: 'Jorge "Tuto" Quiroga',
    partido: 'Alianza Libre',
    imagen: 'https://www.infobae.com/resizer/v2/C2MZCB7IWBF5JK2453HTMNO6L4.jpg?auth=e83fd4519f5c04bd5cfe971368c3d801004c5692ce2906bdb64b5e3b465c703c&smart=true&width=1024&height=512&quality=85',
    descripcion: 'Expresidente de Bolivia con amplia trayectoria política.',
    propuestas: [
      'Lucha contra la corrupción.',
      'Promoción de energías renovables.',
      'Fortalecimiento de las instituciones democráticas.',
    ],
    color: 'from-indigo-600 to-blue-700',
    popularidad: 74.84,
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
    popularidad: 55.16,
  },
  {
    nombre: 'Paulo Folster',
    partido: 'Alianza Libertad y Progreso (ADN)',
    imagen: 'https://static.wixstatic.com/media/2b2d0b_5729ab67ef9f421ab1627dc2bfaf7869~mv2.jpg/v1/fill/w_640,h_708,al_t,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/2b2d0b_5729ab67ef9f421ab1627dc2bfaf7869~mv2.jpg',
    descripcion: 'Empresario y presidente del club deportivo GV San José de Oruro. Lidera la Alianza Libertad y Progreso (ADN).',
    propuestas: [
      'Promover la liberalización económica para atraer inversión privada.',
      'Apoyar iniciativas de desarrollo regional, especialmente en Oruro.',
      'Fomentar el emprendimiento y la innovación en la economía boliviana.',
    ],
    color: 'from-green-600 to-emerald-700',
    popularidad: 33.77,
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
    popularidad: 69.74,
  },
  {
    nombre: 'Rodrigo Paz',
    partido: 'Partido Demócrata Cristiano (PDC)',
    imagen: 'https://apisi.senado.gob.bo/images/RODRIGO_PAZ_PEREIRA_1724703646.jpg',
    descripcion: 'Exalcalde de Tarija con enfoque en desarrollo regional.',
    propuestas: [
      'Desarrollo sostenible del sur del país.',
      'Fortalecimiento de la autonomía regional.',
      'Promoción del turismo cultural.',
    ],
    color: 'from-violet-600 to-purple-700',
    popularidad: 42.59,
  },
];