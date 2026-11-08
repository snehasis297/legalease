import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  ShieldCheck 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RiskBadge from '../../components/analysis/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import documentService from '../../services/documentService';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function AllDocuments() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllDocuments({ page: 0, size: 50 });
      const docs = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Failed to load platform documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (id, fileName) => {
    try {
      const res = await documentService.downloadDocument(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `document-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download document.');
    }
  };

  const docList = Array.isArray(documents) ? documents : [];
  const filtered = docList.filter((doc) => {
    const titleMatch = (doc.title || doc.originalFilename || doc.originalFileName || '').toLowerCase().includes(search.toLowerCase()) ||
                       (doc.userEmail || doc.uploaderName || doc.uploadedBy || '').toLowerCase().includes(search.toLowerCase());
    let riskMatch = true;
    if (filterRisk === 'HIGH') riskMatch = (doc.overallRiskScore || doc.riskScore || 0) >= 70;
    else if (filterRisk === 'MEDIUM') riskMatch = (doc.overallRiskScore || doc.riskScore || 0) >= 40 && (doc.overallRiskScore || doc.riskScore || 0) < 70;
    else if (filterRisk === 'LOW') riskMatch = (doc.overallRiskScore || doc.riskScore || 0) < 40;
    return titleMatch && riskMatch;
  });

  return (
    <DashboardLayout portalType="admin" title="All Documents">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Platform Contracts Audit</h1>
              <p className="text-xs text-slate-300 mt-1">
                Global overview of all encrypted contracts, risk classifications, and metadata.
              </p>
            </div>

            <button
              onClick={fetchDocuments}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition inline-flex items-center gap-2 text-xs shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Registry
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by contract title or uploader email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">All Risk Indices</option>
                <option value="HIGH">High Risk (70-100)</option>
                <option value="MEDIUM">Medium Risk (40-69)</option>
                <option value="LOW">Low Risk (0-39)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No contracts found</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Adjust your search or risk filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Contract Title</th>
                      <th className="py-3.5 px-4 font-semibold">Uploader</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Uploaded Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                          {doc.title || doc.originalFileName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {doc.userEmail || doc.uploadedBy || 'user@example.com'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                            {doc.contractType || 'GENERAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {doc.overallRiskScore !== undefined && doc.overallRiskScore !== null
                            ? `${doc.overallRiskScore}/100`
                            : 'Pending'}
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskBadge level={doc.riskLevel} score={doc.overallRiskScore ?? doc.riskScore} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/client/analysis/${doc.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition"
                            title="Inspect AI Analysis"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.id, doc.originalFileName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white transition"
                            title="Download Encrypted Original"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </DashboardLayout>
  );
}
