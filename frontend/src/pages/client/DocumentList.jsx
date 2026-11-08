import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  UploadCloud, 
  Eye, 
  MessageSquare, 
  Trash2, 
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RiskBadge from '../../components/analysis/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import documentService from '../../services/documentService';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function DocumentList() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getMyDocuments({ page: 0, size: 50 });
      const dList = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setDocuments(Array.isArray(dList) ? dList : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async () => {
    if (!deleteDocId) return;
    try {
      setIsDeleting(true);
      await documentService.deleteDocument(deleteDocId);
      setDocuments((Array.isArray(documents) ? documents : []).filter((d) => d.id !== deleteDocId));
      setDeleteDocId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

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
      alert('Failed to download encrypted document file.');
    }
  };

  // Filtered documents
  const docList = Array.isArray(documents) ? documents : [];
  const filtered = docList.filter((doc) => {
    const titleMatch = (doc.title || doc.originalFileName || doc.originalFilename || '').toLowerCase().includes(search.toLowerCase());
    const typeMatch = filterType === 'ALL' || doc.contractType === filterType;
    let riskMatch = true;
    const score = doc.overallRiskScore ?? doc.riskScore ?? 0;
    if (filterRisk === 'HIGH') riskMatch = score >= 70;
    else if (filterRisk === 'MEDIUM') riskMatch = score >= 40 && score < 70;
    else if (filterRisk === 'LOW') riskMatch = score < 40;
    return titleMatch && typeMatch && riskMatch;
  });

  return (
    <DashboardLayout portalType="client" title="My Documents">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Repository</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage, review, and query all encrypted contracts and risk assessments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDocuments}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm transition"
                title="Refresh List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                to="/client/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
              >
                <UploadCloud className="w-4 h-4" />
                Upload New Contract
              </Link>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents by title or file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="NDA">NDA</option>
                <option value="EMPLOYMENT">Employment</option>
                <option value="SERVICE_AGREEMENT">MSA</option>
                <option value="LEASE">Lease</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LICENSING">Licensing</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk (70-100)</option>
                <option value="MEDIUM">Medium Risk (40-69)</option>
                <option value="LOW">Low Risk (0-39)</option>
              </select>
            </div>
          </div>

          {/* Document Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No documents found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {search || filterType !== 'ALL' || filterRisk !== 'ALL'
                    ? 'No contracts matched your search filters. Try adjusting your query.'
                    : 'You haven’t uploaded any legal contracts yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Document Title</th>
                      <th className="py-3.5 px-4 font-medium">Category</th>
                      <th className="py-3.5 px-4 font-medium">Size</th>
                      <th className="py-3.5 px-4 font-medium">Status</th>
                      <th className="py-3.5 px-4 font-medium">Risk Score</th>
                      <th className="py-3.5 px-4 font-medium">Uploaded Date</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span title={doc.title || doc.originalFileName || doc.originalFilename}>
                              {doc.title || doc.originalFileName || doc.originalFilename}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                            {doc.contractType || 'GENERAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskBadge level={doc.riskLevel} score={doc.overallRiskScore ?? doc.riskScore} />
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-200">
                            {(doc.overallRiskScore !== undefined && doc.overallRiskScore !== null) || (doc.riskScore !== undefined && doc.riskScore !== null)
                              ? `${doc.overallRiskScore ?? doc.riskScore} / 100`
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(doc.createdAt || doc.uploadTime)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/client/analysis/${doc.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition"
                            title="View Analysis"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/client/chat/${doc.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-white transition"
                            title="Interactive Q&A"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.id, doc.originalFileName || doc.originalFilename)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white transition"
                            title="Download Encrypted File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteDocId(doc.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                            title="Delete Contract"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {deleteDocId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteDocId(null)}
          title="Delete Contract"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this contract, its extracted clauses, and chat history? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteDocId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium transition"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
