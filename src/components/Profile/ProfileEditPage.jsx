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
  <div className="max-w-2xl mx-auto p-4">
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700/60 overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-slate-200/60 dark:border-gray-700/60">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar Perfil</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Actualiza tu información personal</p>
      </div>

      {message.text && (
        <div className={`p-4 ${
          message.type === 'success' 
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-l-4 border-emerald-500' 
            : 'bg-rose-50/80 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-l-4 border-rose-500'
        }`}>
          {message.text}
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <FiCamera size={24} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Haz clic para cambiar el avatar</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <FiUser size={16} />
                <span>Usuario</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <FiMail size={16} />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <FiPhone size={16} />
                <span>Teléfono</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
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
                className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <FiMapPin size={16} />
              <span>Ubicación</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <FiUser size={16} />
              <span>Biografía</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
              {form.bio.length}/500 caracteres
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-sm disabled:opacity-50 font-medium"
            >
              <FiSave size={16} />
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