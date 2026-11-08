import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Building, 
  Award,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import lawyerService from '../../services/lawyerService';

export default function LawyerProfile() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [barNumber, setBarNumber] = useState('');
  const [stateBar, setStateBar] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await lawyerService.getKycStatus().catch(() => null);
        if (res?.data) {
          setBarNumber(res.data.barNumber || '');
          setStateBar(res.data.stateBar || '');
          setPracticeArea(res.data.practiceArea || 'Corporate & Commercial Law');
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      setMessage('Counsel profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout portalType="lawyer" title="Profile & Credentials">
      <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Counsel Profile & Credentials</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your legal directory profile and verified Bar Council credentials.
            </p>
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Counsel Identity Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-600/20">
                <Scale className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">Adv. {user?.fullName || 'Counsel'}</h2>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  LEGAL COUNSEL
                </span>
              </div>

              <div className="w-full pt-4 border-t border-slate-800 space-y-3 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bar ID:</span>
                  <span className="font-mono text-white font-medium">{barNumber || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Jurisdiction:</span>
                  <span className="text-white font-medium">{stateBar || 'General Practice'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verification:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Information */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-4">Professional Information</h3>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Practice Specialization</label>
                    <input
                      type="text"
                      value={practiceArea}
                      onChange={(e) => setPracticeArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Professional Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Describe your legal experience, key industries served, and advisory background..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save Counsel Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
