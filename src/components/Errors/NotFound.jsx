import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FiHome, FiArrowLeft, FiAlertTriangle, FiMail, FiGithub } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

const NotFound = () => {
  const { theme } = useTheme();
  const [counter, setCounter] = useState(15);

  // Redirección automática opcional
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-2xl w-full text-center">
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          
          {/* Animación del número 404 */}
          <div className="relative mb-8">
             <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
            <h1 className={`text-9xl font-bold bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-red-400 to-purple-400' 
                : 'from-red-500 to-purple-500'
            } bg-clip-text text-transparent`}>
              404
            </h1>
            <div className={`absolute inset-0 text-9xl font-bold opacity-10 blur-sm ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              404
            </div>
          </div>

          <h2 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            ¡Ups! Página no encontrada
          </h2>
          
          <p className={`text-xl mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            La página que buscas no existe.
          </p>
          
          <p className={`text-lg mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Serás redirigido automáticamente en <span className="font-bold text-blue-500">{counter}</span> segundos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/"
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } shadow-lg hover:shadow-xl`}
            >
              <FiHome className="w-5 h-5" />
              Ir al Inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border ${
                theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
              } shadow-lg hover:shadow-xl`}
            >
              <FiArrowLeft className="w-5 h-5" />
              Volver Atrás
            </button>
          </div>

          {/* Enlaces de soporte */}
          <div className={`mt-8 pt-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ¿Necesitas ayuda?
            </p>
            <div className="flex justify-center gap-4">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                <FiMail className="w-4 h-4" />
                Soporte
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                <FiGithub className="w-4 h-4" />
                Reportar Error
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;