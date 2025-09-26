import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setLocalError('');
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      // Limpiar error después de 5 segundos
      const timer = setTimeout(() => {
        setLocalError('');
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (localError) {
      setLocalError('');
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El formato del email es inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      // Manejar errores específicos del servidor
      if (result.error?.includes('credenciales')) {
        setLocalError('Email o contraseña incorrectos');
      } else if (result.error?.includes('cuenta')) {
        setLocalError('Tu cuenta necesita verificación');
      } else if (result.error) {
        setLocalError(result.error);
      }
    }
  };

  const getErrorMessage = (error) => {
    if (error.includes('credenciales') || error.includes('invalid')) {
      return 'Email o contraseña incorrectos. Por favor, verifica tus datos.';
    }
    if (error.includes('network') || error.includes('conexión')) {
      return 'Error de conexión. Por favor, verifica tu internet.';
    }
    if (error.includes('verificación') || error.includes('verified')) {
      return 'Tu cuenta necesita verificación. Revisa tu email.';
    }
    return error;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-gray-600">Bienvenido de vuelta</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error General */}
            {localError && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm animate-in slide-in-from-top-5 duration-300">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{getErrorMessage(localError)}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <FiAlertCircle className="w-4 h-4" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      fieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <FiAlertCircle className="w-4 h-4" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Enlace de olvidó contraseña */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de envío */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiLock className="w-4 h-4" />
                    Iniciar sesión
                  </span>
                )}
              </button>
            </div>

            {/* Enlace a registro */}
            <div className="text-center pt-4 border-t border-gray-200/50">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-500 transition-colors duration-300 underline"
                >
                  Regístrate ahora
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;