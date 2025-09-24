import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { userAPI } from '../../api/api';
import { URL_SERVER } from '../../api/url';

export function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    phone: '',
    age: '',
    location: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        age: user.age || '',
        location: user.location || '',
      });
      setAvatarPreview(`${URL_SERVER}${user.avatar}`);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await userAPI.updateProfile(form);
      if (res.success) {
        updateUser(res.user);
        showMessage('success', 'Perfil actualizado correctamente');
      } else {
        showMessage('error', 'Error al actualizar el perfil');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview inmediato
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);

    setAvatarFile(file);
    
    try {
      const res = await userAPI.updateAvatar(file);
      if (res.success) {
        updateUser(res.user);
        showMessage('success', 'Avatar actualizado correctamente');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error al actualizar el avatar');
      setAvatarPreview(`${URL_SERVER}${user.avatar}`); // Revertir preview
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Debes iniciar sesión para editar tu perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Editar Perfil</h2>
          <p className="opacity-90">Actualiza tu información personal</p>
        </div>

        {/* Mensajes de estado */}
        {message.text && (
          <div className={`p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera size={24} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-gray-600 mt-2">Haz clic en la imagen para cambiar el avatar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiUser size={16} />
                  <span>Nombre de usuario</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiMail size={16} />
                  <span>Correo electrónico</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiPhone size={16} />
                  <span>Teléfono</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Edad */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiCalendar size={16} />
                  <span>Edad</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FiMapPin size={16} />
                  <span>Ubicación</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FiUser size={16} />
                <span>Biografía</span>
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Cuéntanos algo sobre ti..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {form.bio.length}/500 caracteres
              </p>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiSave size={18} />
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default ProfileEditPage