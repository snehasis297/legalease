import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import lawyerService from '../../services/lawyerService';

const PRACTICE_AREAS = [
  'Corporate & Commercial Law',
  'Intellectual Property & Patents',
  'Labor & Employment',
  'M&A and Venture Capital',
  'Real Estate & Leasing',
  'Cybersecurity & Privacy Law',
  'General Contract Advisory',
];

export default function KycUpload() {
  const navigate = useNavigate();

  const [barNumber, setBarNumber] = useState('');
  const [stateBar, setStateBar] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [practiceArea, setPracticeArea] = useState(PRACTICE_AREAS[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Verification document must be under 10MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please attach your official Bar Council Certificate or Practicing License.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('barNumber', barNumber.trim());
      formData.append('stateBar', stateBar.trim());
      formData.append('experienceYears', experienceYears);
      formData.append('practiceArea', practiceArea);

      await lawyerService.submitKyc(formData);
      navigate('/lawyer/kyc-status');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout portalType="lawyer" title="Bar License Upload">
      <div className="max-w-3xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/lawyer/dashboard')}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Counsel Dashboard
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Bar Council Verification (KYC)</h1>
              <p className="text-xs text-slate-400 mt-1">
                Upload your legal practicing credentials. Verified advocates receive access to client contract reviews and expert redline workflows.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  Professional Licensing Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Bar Council Enrollment ID *</label>
                    <input
                      type="text"
                      value={barNumber}
                      onChange={(e) => setBarNumber(e.target.value)}
                      placeholder="e.g. BAR/2018/98421"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">State / Jurisdiction Bar *</label>
                    <input
                      type="text"
                      value={stateBar}
                      onChange={(e) => setStateBar(e.target.value)}
                      placeholder="e.g. Bar Council of California / Delhi"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Years in Practice *</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Primary Practice Specialization</label>
                    <select
                      value={practiceArea}
                      onChange={(e) => setPracticeArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {PRACTICE_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload Certificate */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  Proof of Certification (PDF, PNG, JPG — Max 10MB)
                </h2>

                <div className="p-8 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl text-center bg-slate-950/40 cursor-pointer relative transition">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 text-emerald-400 mb-2" />
                      <p className="text-xs font-semibold text-white">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to submit
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                      <p className="text-xs font-semibold text-white">Click or drag your Bar License Certificate here</p>
                      <p className="text-[11px] text-slate-500 mt-1">Official high-resolution scan required for automated OCR verification</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Encrypted via AES-256-GCM and reviewed exclusively by compliance admins.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {submitting ? 'Submitting Credentials...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
    </DashboardLayout>
  );
}
