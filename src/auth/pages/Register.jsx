import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../../api/api';


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    bio: '',
    location: '',
    interests: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);
  
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Limpiar error de validación cuando el usuario escribe
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      errors.age = 'La edad debe estar entre 13 y 120 años';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'El teléfono debe tener 10 dígitos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) return;
    
    setIsChecking(true);
    try {
      const response = await authAPI.checkUsername(username);
      if (!response.available) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Este nombre de usuario ya está en uso',
        }));
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!email) return;
    
    setIsChecking(true);
    try {
      const response = await authAPI.checkEmail(email);
      if (!response.available) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Este email ya está en uso',
        }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      bio: formData.bio || undefined,
      location: formData.location || undefined,
      interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : [],
    };

    const result = await register(userData);
    
    if (result.success) {
      navigate('/');
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl w-full space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Crear cuenta
          </h2>
          <p className="mt-2 text-gray-600">Únete a nuestra comunidad</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength="3"
                  maxLength="30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={(e) => checkUsernameAvailability(e.target.value)}
                />
                {validationErrors.username && (
                  <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => checkEmailAvailability(e.target.value)}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Confirmar"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Edad
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="13"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Edad"
                    value={formData.age}
                    onChange={handleChange}
                  />
                  {validationErrors.age && (
                    <p className="text-red-500 text-xs mt-2 bg-red-50 px-2 py-1 rounded-lg">{validationErrors.age}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Ciudad, País"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  Intereses (separados por comas)
                </label>
                <input
                  id="interests"
                  name="interests"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="música, deportes, tecnología"
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  placeholder="Cuéntanos sobre ti..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || isChecking}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200/50">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              ¿Ya tienes cuenta? <span className="font-bold">Inicia sesión</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default Register;