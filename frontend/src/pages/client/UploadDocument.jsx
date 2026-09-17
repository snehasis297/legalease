import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import UploadZone from '../../components/document/UploadZone';
import AnalyzingOverlay from '../../components/document/AnalyzingOverlay';
import documentService from '../../services/documentService';
import analysisService from '../../services/analysisService';

const CONTRACT_TYPES = [
  { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'EMPLOYMENT', label: 'Employment / Consulting Contract' },
  { value: 'SERVICE_AGREEMENT', label: 'Master Services Agreement (MSA)' },
  { value: 'LEASE', label: 'Commercial / Residential Lease' },
  { value: 'COMMERCIAL', label: 'Vendor / Purchase Agreement' },
  { value: 'LICENSING', label: 'Intellectual Property / Software License' },
  { value: 'OTHER', label: 'General / Other Legal Document' },
];

export default function UploadDocument() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [contractType, setContractType] = useState('NDA');
  const [notes, setNotes] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (!title && file) {
      // Auto-populate title from clean filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop a valid PDF, DOCX, or TXT contract file.');
      return;
    }
    if (!title.trim()) {
      setError('Please specify a title for this contract.');
      return;
    }

    try {
      setError('');
      setIsUploading(true);
      setUploadProgress(15);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('contractType', contractType);
      if (notes.trim()) formData.append('notes', notes.trim());

      // Simulate progress progression for smooth UX
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const uploadRes = await documentService.uploadDocument(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      const documentId = uploadRes.data?.id || uploadRes.data?.documentId;
      setIsUploading(false);

      if (!documentId) {
        throw new Error('Server did not return a valid document identifier.');
      }

      // Step 2: Trigger AI Legal Risk Analysis
      setIsAnalyzing(true);
      await analysisService.triggerAnalysis(documentId);

      // Successfully triggered & parsed, redirect to results
      setTimeout(() => {
        setIsAnalyzing(false);
        navigate(`/client/analysis/${documentId}`);
      }, 1500);

    } catch (err) {
      setIsUploading(false);
      setIsAnalyzing(false);
      setError(err.response?.data?.message || err.message || 'Failed to upload and analyze document.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Upload Legal Contract</h1>
              <p className="text-xs text-slate-400 mt-1">
                Upload your contract for client-side validation, AES-256-GCM encryption, and AI risk categorization.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Dropzone */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Document File (PDF, DOCX, TXT — Max 25MB)
                </label>
                <UploadZone
                  onFileSelected={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={() => setSelectedFile(null)}
                />
              </div>

              {/* Metadata Fields */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <h2 className="text-sm font-semibold text-white mb-2">Contract Metadata</h2>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Contract Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Services Agreement with Acme Corp"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Contract Category</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {CONTRACT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Confidentiality Level</label>
                    <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-xs text-indigo-300 font-mono">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      AES-256-GCM Secure Envelope
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Internal Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Key counterparties, renewal dates, or specific liability sections you want flagged..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit & Security Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Files are decrypted strictly in volatile memory during AI inference.</span>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || isAnalyzing || !selectedFile}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload & Analyze Contract'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <AnalyzingOverlay />
      )}
    </div>
  );
}
