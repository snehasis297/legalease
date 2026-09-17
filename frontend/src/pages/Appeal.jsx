import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, Loader2, Camera, FileText } from 'lucide-react';
import { appealService } from '../services/appealService';
import toast from 'react-hot-toast';

export const Appeal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [tokenInput, setTokenInput] = useState(token || '');
  const [validating, setValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [appealData, setAppealData] = useState(null);

  const [reason, setReason] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      validate(token);
    }
  }, [token]);

  const validate = async (tok) => {
    setValidating(true);
    setErrorMessage('');
    try {
      const res = await appealService.validateToken(tok);
      setAppealData(res.data);
      setTokenValid(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('expired')) {
        navigate('/appeal/expired');
      } else if (msg.includes('already')) {
        setErrorMessage('An appeal for this token has already been submitted and is in review.');
      } else {
        navigate('/appeal/invalid');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!tokenInput || !reason) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('token', tokenInput);
      formData.append('reason', reason);
      if (idImage) formData.append('idImage', idImage);
      if (selfieImage) formData.append('selfieImage', selfieImage);

      await appealService.submitAppeal(formData);
      toast.success('Appeal submitted successfully');
      navigate('/appeal/success');
    } catch (err) {
      setErrorMessage(err.message || 'Appeal submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4 shadow-glow-purple">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Account Identity &amp; Safety Appeal
          </h2>
          <p className="mt-2 text-xs text-textSecondary">
            Secure submission portal &bull; AES-256 encrypted storage &bull; Reviewed in 24–48 hours
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!tokenValid ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Enter Your 30-Day Appeal Security Token
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.trim())}
                  placeholder="Paste UUID token from your email"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="button"
                onClick={() => validate(tokenInput)}
                disabled={validating || !tokenInput}
                className="w-full flex items-center justify-center py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
              >
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate Token & Open Appeal'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitAppeal} className="space-y-6 animate-in fade-in duration-300">
              {/* Account summary banner */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-textSecondary">Account Email:</span>
                  <span className="font-mono text-white">{appealData?.maskedEmail}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-textSecondary">Pause Reason:</span>
                  <span className="text-warning font-medium">{appealData?.disableReason || 'Security flag'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Explanation / Statement of Appeal
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this account was flagged or confirm your identity..."
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Government ID Image */}
                <div className="p-4 rounded-xl border border-dashed border-white/20 text-center space-y-2">
                  <FileText className="w-6 h-6 text-accent mx-auto" />
                  <label className="block text-xs font-semibold text-white cursor-pointer">
                    Clear Photo of Government ID
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-textSecondary">
                    {idImage ? idImage.name : 'PNG, JPG, PDF (Max 5MB)'}
                  </p>
                </div>

                {/* Selfie holding ID */}
                <div className="p-4 rounded-xl border border-dashed border-white/20 text-center space-y-2">
                  <Camera className="w-6 h-6 text-accent mx-auto" />
                  <label className="block text-xs font-semibold text-white cursor-pointer">
                    Selfie Holding Your ID
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelfieImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-textSecondary">
                    {selfieImage ? selfieImage.name : 'PNG, JPG (Max 5MB)'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Appeal for Human Review'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 text-center">
            <Link to="/login" className="text-xs text-textSecondary hover:text-white">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appeal;
