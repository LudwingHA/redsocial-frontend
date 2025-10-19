import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { userAPI } from '../../api/api';
import { URL_SERVER } from '../../api/url';
import ThemeToggle from '../ThemeToggle';

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
  <div className="max-w-xl mx-auto p-4 lg:p-6 animate-in fade-in duration-300">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden transition-all duration-300">
      
      {/* HEADER */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-700/20 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Ajustes de Perfil</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Gestiona tu información y avatar de forma segura.</p>
        </div>
        <ThemeToggle />
      </div>

      {message.text && (
        <div className={`p-4 mx-4 mt-4 rounded-xl font-medium transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
        } flex items-center gap-3`}
        >
          {message.text}
        </div>
      )}

      <div className="p-6">
       
        <div className="flex flex-col items-center mb-8">
          <div className="relative group w-28 h-28">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
              onError={(e) => { e.target.src = "/default-avatar.png"; }}
            />
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-inner">
              <FiCamera size={24} className="text-white transform group-hover:scale-110 transition-transform" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm font-medium">Cambiar foto de perfil</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiUser size={16} className="text-blue-500 dark:text-blue-400" />
                <span>Nombre de Usuario</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Ej: juan_perez"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiMail size={16} className="text-purple-500 dark:text-purple-400" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
                required
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiPhone size={16} className="text-green-500 dark:text-green-400" />
                <span>Teléfono</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+52 55 XXXX XXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiCalendar size={16} className="text-yellow-500 dark:text-yellow-400" />
                <span>Edad</span>
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="1"
                max="120"
                placeholder="30"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
              />
            </div>
            

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiMapPin size={16} className="text-red-500 dark:text-red-400" />
                <span>Ubicación</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Ciudad de México"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <FiUser size={16} className="text-cyan-500 dark:text-cyan-400" />
              <span>Biografía</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Escribe una breve descripción de ti para tu perfil..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 shadow-inner text-sm"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-right font-light">
              {form.bio.length}/500 caracteres
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700/50">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-wait font-bold transform hover:scale-[1.01]"
            >
              <FiSave size={18} />
              <span>{saving ? 'Guardando Cambios...' : 'Guardar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);}
export default ProfileEditPage