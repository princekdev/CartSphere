import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiEdit2, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.put('/auth/profile', { name });
      await dispatch(fetchProfile());
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-gray-900">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FiUser size={14} /> Full Name</label>
            {editing ? (
              <div className="flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                <button onClick={handleSave} disabled={loading} className="btn-primary px-4 flex items-center gap-1">
                  <FiCheck /> Save
                </button>
                <button onClick={() => setEditing(false)} className="px-4 border rounded-md hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between input-field bg-gray-50">
                <span>{user?.name}</span>
                <button onClick={() => setEditing(true)} className="text-yellow-600 hover:text-yellow-700"><FiEdit2 size={15} /></button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FiMail size={14} /> Email Address</label>
            <div className="input-field bg-gray-50 text-gray-500">{user?.email}</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}</p>
        </div>
      </div>
    </div>
  );
}
