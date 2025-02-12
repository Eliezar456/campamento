import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCampStore } from '../store/campStore';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [leaderName, setLeaderName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, adminLogin } = useAuthStore();
  const { leaders } = useCampStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'admin') {
      if (adminLogin(password)) {
        navigate('/admin');
        return;
      }
    }
    
    // Validate leader exists
    const leaderExists = leaders.some(leader => leader.name === leaderName);
    
    if (!leaderExists) {
      setError('Líder no encontrado');
      return;
    }
    
    if (login(leaderName)) {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4QJrHTBxEEDukM-IexLwKP7ATsl6NGfYDEg&s" 
            alt="Tierra Alta Logo" 
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Campamento</h1>
          <p className="text-gray-600 mt-2">Por favor ingresa tus credenciales</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              Tierra Alta Canalitos organizamos viajes al campamento de Tierra Alta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Líder
            </label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa el nombre del líder"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}