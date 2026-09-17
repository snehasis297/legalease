import React from 'react';
import { formatDate } from '../../utils/formatters';

export const UserTable = ({ users = [], onUpdateStatus, onUpdateRole }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/20 text-success border-success/40';
      case 'PENDING_VERIFICATION':
      case 'PENDING_KYC':
        return 'bg-warning/20 text-warning border-warning/40';
      case 'TEMPORARILY_DISABLED':
      case 'DISABLED':
      case 'AGE_VERIFICATION_REQUIRED':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'LOCKED':
      case 'SUSPENDED':
        return 'bg-danger/20 text-danger border-danger/40';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#121220] text-textSecondary uppercase font-mono text-[11px] border-b border-white/10">
          <tr>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Phone</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Joined</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-4">
                <div className="font-semibold text-white">{u.fullName}</div>
                <div className="text-xs text-textSecondary">{u.email}</div>
              </td>
              <td className="py-3.5 px-4">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-accent">
                  {u.role}
                </span>
              </td>
              <td className="py-3.5 px-4 font-mono text-textSecondary">
                {u.maskedPhone || '—'}
              </td>
              <td className="py-3.5 px-4">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(u.accountStatus)}`}>
                  {u.accountStatus}
                </span>
              </td>
              <td className="py-3.5 px-4 text-xs text-textSecondary">
                {formatDate(u.createdAt)}
              </td>
              <td className="py-3.5 px-4 text-right space-x-2">
                <select
                  value={u.accountStatus}
                  onChange={(e) => onUpdateStatus(u.id, e.target.value)}
                  className="bg-card border border-white/20 text-xs rounded-lg px-2 py-1 text-white focus:outline-none focus:border-accent"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                  <option value="PENDING_KYC">PENDING_KYC</option>
                  <option value="TEMPORARILY_DISABLED">TEMPORARILY_DISABLED</option>
                  <option value="DISABLED">DISABLED</option>
                  <option value="AGE_VERIFICATION_REQUIRED">AGE_VERIFICATION_REQUIRED</option>
                  <option value="LOCKED">LOCKED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>

                <select
                  value={u.role}
                  onChange={(e) => onUpdateRole(u.id, e.target.value)}
                  className="bg-card border border-white/20 text-xs rounded-lg px-2 py-1 text-white focus:outline-none focus:border-accent"
                >
                  <option value="CLIENT">CLIENT</option>
                  <option value="LAWYER">LAWYER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
