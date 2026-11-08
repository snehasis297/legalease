import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import OtpInput from '../components/auth/OtpInput';
import toast from 'react-hot-toast';

export const VerifyPhone = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.sendPhoneOtp({ phoneNumber });
      setOtpSent(true);
      toast.success('SMS code dispatched (Logged to server console in dev mode)');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send SMS OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.verifyPhone({ otp, phoneNumber });
      toast.success('Phone verified successfully!');
      navigate('/submit-kyc');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Step 2: Phone Verification</h2>
        <p className="mt-2 text-xs text-textSecondary max-w-sm mx-auto">
          Add phone security to protect against unauthorized account recovery.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-6 rounded-2xl border border-white/10 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification SMS'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider text-center mb-4">
                  Enter 6-Digit SMS Code
                </label>
                <OtpInput length={6} value={otp} onChange={setOtp} />
                <p className="text-[11px] text-slate-400 text-center mt-3 font-mono">
                  Enter the 6-digit verification code delivered to your phone.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Confirm Phone &bull; Proceed to KYC</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/submit-kyc')}
              className="text-xs text-textSecondary hover:text-white transition-colors"
            >
              Skip to Government ID KYC &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
