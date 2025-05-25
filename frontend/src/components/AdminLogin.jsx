import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import '../css/crud.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener el token y verificar el rol
      const idTokenResult = await user.getIdTokenResult();
      const userEmail = idTokenResult.claims.email || user.email;
      const role = userEmail.endsWith('@admin.com') ? 'admin' : 'juror';

      if (role !== 'admin') {
        await auth.signOut(); // Cerrar sesión si el rol no es correcto
        setError('Acceso denegado: Esta cuenta no es de un administrador.');
        return;
      }

      alert('Autenticación exitosa con Firebase como administrador');
      console.log('Usuario autenticado:', user);
      navigate('/admin-crud');
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login de Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              Iniciar Sesión
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogin;