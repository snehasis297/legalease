import React from 'react';
import { FileText, ArrowRight, MessageSquare, Download, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatBytes } from '../../utils/formatters';

export const DocumentCard = ({ document, onDelete }) => {
  const getRiskColor = (level) => {
    if (level === 'HIGH') return 'bg-danger/20 text-danger border-danger/40';
    if (level === 'MEDIUM') return 'bg-warning/20 text-warning border-warning/40';
    return 'bg-success/20 text-success border-success/40';
  };

  const isDone = document.status === 'DONE';

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group flex flex-col justify-between">
      <div>
        {/* Top bar: Status & Score */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              document.status === 'DONE'
                ? 'bg-success/20 text-success border-success/40'
                : document.status === 'PROCESSING'
                ? 'bg-accent/20 text-accent border-accent/40 animate-pulse'
                : 'bg-white/10 text-textSecondary border-white/20'
            }`}
          >
            {document.status}
          </span>

          {document.riskScore != null && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${getRiskColor(
                document.riskLevel
              )}`}
            >
              Risk: {document.riskScore}/100 ({document.riskLevel})
            </span>
          )}
        </div>

        {/* File Info */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors">
              {document.originalFilename}
            </h4>
            <p className="text-xs text-textSecondary mt-0.5 font-mono">
              {formatBytes(document.fileSize)} &bull; {formatDate(document.uploadTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {isDone && (
            <>
              <Link
                to={`/client/documents/${document.id}/analysis`}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-xs font-semibold text-white transition-colors flex items-center space-x-1 shadow-glow-purple"
              >
                <span>Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={`/client/documents/${document.id}/chat`}
                className="p-1.5 rounded-lg border border-white/10 hover:border-accent text-textSecondary hover:text-white transition-colors"
                title="Chat with Document"
              >
                <MessageSquare className="w-4 h-4 text-accent" />
              </Link>
            </>
          )}

          <a
            href={`/api/documents/${document.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-textSecondary hover:text-white transition-colors"
            title="Download Decrypted Original"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(document.id)}
            className="p-1.5 rounded-lg text-textSecondary hover:text-danger hover:bg-danger/10 transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
