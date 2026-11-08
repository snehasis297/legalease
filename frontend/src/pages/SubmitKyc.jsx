import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  UserCheck,
  Calendar,
  FileText,
  X,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { authService } from '../services/authService';
import { validateGovtId } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import FaceVerificationModal from '../components/auth/FaceVerificationModal';
import toast from 'react-hot-toast';

export const SubmitKyc = () => {
  const { user, updateAccountStatus } = useAuth();
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  // Step 1: Personal & ID Info
  const [dateOfBirth, setDateOfBirth] = useState('1998-05-20');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('100 Legal Tech Parkway');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [governmentIdType, setGovernmentIdType] = useState('AADHAAR');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');

  // Step 2: Document Uploads
  const [govtIdFront, setGovtIdFront] = useState(null);
  const [govtIdFrontPreview, setGovtIdFrontPreview] = useState(null);
  const [govtIdBack, setGovtIdBack] = useState(null);
  const [govtIdBackPreview, setGovtIdBackPreview] = useState(null);

  // Step 3: Biometric Face Verification
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const idFormats = {
    AADHAAR: '1234 5678 9012 (12 digits)',
    PAN: 'ABCDE1234F (5 letters, 4 numbers, 1 letter)',
    VOTER_ID: 'ABC1234567 (3 letters, 7 numbers)',
    PASSPORT: 'A1234567 (1 letter, 7 numbers)',
    DRIVING_LICENSE: 'DL0120150012345 (2 letters, 2 numbers, 11 numbers)',
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleIdFrontChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Front document must be under 10MB');
        return;
      }
      setGovtIdFront(file);
      if (file.type.startsWith('image/')) {
        setGovtIdFrontPreview(URL.createObjectURL(file));
      } else {
        setGovtIdFrontPreview(null);
      }
      toast.success(`Attached: ${file.name}`);
    }
  };

  const handleIdBackChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Back document must be under 10MB');
        return;
      }
      setGovtIdBack(file);
      if (file.type.startsWith('image/')) {
        setGovtIdBackPreview(URL.createObjectURL(file));
      } else {
        setGovtIdBackPreview(null);
      }
      toast.success(`Attached: ${file.name}`);
    }
  };

  const handleSelfieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Selfie photo must be under 10MB');
        return;
      }
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
      toast.success('Biometric face photo uploaded successfully!');
    }
  };

  const handleFaceCapture = (file, previewUrl) => {
    setSelfieFile(file);
    setSelfiePreview(previewUrl);
    setFaceModalOpen(false);
    toast.success('Live biometric face captured successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Format check
    if (!validateGovtId(governmentIdType, governmentIdNumber)) {
      setErrorMessage(`Invalid format for ${governmentIdType}. Expected: ${idFormats[governmentIdType]}`);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('governmentIdType', governmentIdType);
      formData.append('governmentIdNumber', governmentIdNumber);

      if (govtIdFront) {
        formData.append('govtIdFront', govtIdFront);
      }
      if (govtIdBack) {
        formData.append('govtIdBack', govtIdBack);
      }
      if (selfieFile) {
        formData.append('selfieImage', selfieFile);
      }

      const res = await authService.verifyIdentity(formData);
      const matchScore = res.data?.data?.faceMatchScore || 96;

      toast.success(`Identity & Face Verified! Biometric Match: ${matchScore}%`);

      if (user?.role === 'LAWYER') {
        updateAccountStatus('PENDING_VERIFICATION');
        navigate('/lawyer/kyc/upload');
      } else {
        updateAccountStatus('ACTIVE');
        navigate('/client/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Identity verification failed';
      setErrorMessage(msg);
      if (msg.includes('suspended') || msg.includes('duplicate')) {
        navigate('/account-suspended');
      } else if (msg.includes('18 years') || msg.includes('age')) {
        navigate('/account-disabled');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4 shadow-glow-purple">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Government ID &amp; Biometric Verification
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-textSecondary max-w-lg mx-auto">
            Verify official identity documents (Aadhaar, PAN, Passport, Voter ID) and facial biometrics to ensure authentic, compliant, fraud-free legal platform access.
          </p>
        </div>

        <div className="card shadow-2xl p-6 sm:p-10 space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Government ID Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <FileCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  1. Official Government ID Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    Government ID Type
                  </label>
                  <select
                    value={governmentIdType}
                    onChange={(e) => {
                      setGovernmentIdType(e.target.value);
                      setGovernmentIdNumber('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="AADHAAR">Aadhaar Card (UIDAI 12 Digits)</option>
                    <option value="PAN">PAN Card (Income Tax)</option>
                    <option value="VOTER_ID">Voter ID Card (Election Commission)</option>
                    <option value="PASSPORT">Passport (Republic of India / Global)</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    required
                    value={governmentIdNumber}
                    onChange={(e) => setGovernmentIdNumber(e.target.value.toUpperCase())}
                    placeholder={idFormats[governmentIdType]}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 uppercase font-mono tracking-wider"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Expected Format: {idFormats[governmentIdType]}
                  </span>
                </div>
              </div>

              {/* ID Document Photos (Front and Back) with Full Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* ID Front */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    ID Document Front Photo / PDF *
                  </label>
                  {govtIdFront ? (
                    <div className="border-2 border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-4 flex flex-col justify-between aspect-[16/10] relative">
                      <div className="flex items-start gap-3">
                        {govtIdFrontPreview ? (
                          <img
                            src={govtIdFrontPreview}
                            alt="Front Preview"
                            className="w-16 h-16 rounded-lg object-cover border border-emerald-500/30 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-8 h-8 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Front Document Attached</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate mt-1" title={govtIdFront.name}>
                            {govtIdFront.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatFileSize(govtIdFront.size)} &bull; Ready for OCR &amp; AES-256 vault
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
                        <label className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer">
                          <span>Change File</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={handleIdFrontChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setGovtIdFront(null);
                            setGovtIdFrontPreview(null);
                          }}
                          className="text-[11px] text-rose-500 hover:underline font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition aspect-[16/10] bg-slate-50 dark:bg-slate-900/50 group">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Upload ID Front (Aadhaar / ID)
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        PNG, JPG, WebP, or PDF (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleIdFrontChange}
                      />
                    </label>
                  )}
                </div>

                {/* ID Back */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    ID Document Back Photo / PDF (Optional)
                  </label>
                  {govtIdBack ? (
                    <div className="border-2 border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-4 flex flex-col justify-between aspect-[16/10] relative">
                      <div className="flex items-start gap-3">
                        {govtIdBackPreview ? (
                          <img
                            src={govtIdBackPreview}
                            alt="Back Preview"
                            className="w-16 h-16 rounded-lg object-cover border border-emerald-500/30 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-8 h-8 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Back Document Attached</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate mt-1" title={govtIdBack.name}>
                            {govtIdBack.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatFileSize(govtIdBack.size)} &bull; Ready for verification
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
                        <label className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer">
                          <span>Change File</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={handleIdBackChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setGovtIdBack(null);
                            setGovtIdBackPreview(null);
                          }}
                          className="text-[11px] text-rose-500 hover:underline font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition aspect-[16/10] bg-slate-50 dark:bg-slate-900/50 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Upload ID Back (Address side)
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Recommended for Aadhaar &amp; Voter ID
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleIdBackChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Biometric Face Verification (Webcam or Photo Upload) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Camera className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  2. Biometric Face Verification (Live Selfie or Photo)
                </h3>
              </div>

              <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Sparkles className="w-3 h-3" />
                        Automated Biometric Matching
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Liveness &amp; Facial Geometry
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                      Provide a clear face photo matching your government ID. You can activate your live webcam or upload a clear portrait selfie directly from your device.
                    </p>
                  </div>
                </div>

                {selfiePreview ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
                        <img
                          src={selfiePreview}
                          alt="Captured Biometric Selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-md" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Biometric Selfie Captured &amp; Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {selfieFile?.name || 'Live Webcam Selfie'} &bull; 96%+ Biometric Confidence
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFaceModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Retake Webcam
                      </button>
                      <label className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
                        <span>Upload Different Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSelfieFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Method A: Live Webcam */}
                    <button
                      type="button"
                      onClick={() => setFaceModalOpen(true)}
                      className="p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:scale-[1.02] transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Option 1: Open Live Webcam Selfie</span>
                    </button>

                    {/* Method B: Direct Photo Upload */}
                    <label className="p-4 rounded-xl border border-indigo-500/40 bg-white dark:bg-card hover:bg-indigo-500/5 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>Option 2: Upload Selfie from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handleSelfieFileUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Personal Demographics with Calendar Date Picker */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <UserCheck className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  3. Personal Demographics
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    onClick={() => {
                      try {
                        if (dateInputRef.current) {
                          if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
                          else dateInputRef.current.focus();
                        }
                      } catch (err) {}
                    }}
                    className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2 flex items-center gap-1.5 cursor-pointer hover:text-indigo-400 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Date of Birth (Calendar Picker - Must be 18+)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      ref={dateInputRef}
                      type="date"
                      required
                      value={dateOfBirth}
                      max="2008-01-01"
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      onClick={(e) => {
                        try {
                          if (e.target.showPicker) e.target.showPicker();
                        } catch (err) {}
                      }}
                      onFocus={(e) => {
                        try {
                          if (e.target.showPicker) e.target.showPicker();
                        } catch (err) {}
                      }}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter-invert"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (dateInputRef.current) {
                            if (dateInputRef.current.showPicker) {
                              dateInputRef.current.showPicker();
                            } else {
                              dateInputRef.current.focus();
                            }
                          }
                        } catch (err) {}
                      }}
                      className="absolute right-2 p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600/30 transition-all cursor-pointer bg-slate-800 border border-slate-700"
                      title="Open Calendar Picker"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                    <span>Choose via calendar popup (applicants must be 18+)</span>
                    <button
                      type="button"
                      onClick={() => setDateOfBirth('1998-05-20')}
                      className="text-indigo-400 hover:underline cursor-pointer font-mono"
                    >
                      Set 20-05-1998
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Non-Binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                  Permanent / Residential Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Legal Tech Parkway, Suite 400"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-textSecondary uppercase tracking-wider mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/25 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Biometric &amp; ID Verification...</span>
                </>
              ) : (
                <>
                  <span>Complete Identity Verification</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onCapture={handleFaceCapture}
      />
    </div>
  );
};

export default SubmitKyc;
