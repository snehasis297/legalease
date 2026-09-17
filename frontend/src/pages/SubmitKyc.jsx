import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { validateGovtId } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const SubmitKyc = () => {
  const { user, updateAccountStatus } = useAuth();
  const navigate = useNavigate();

  const [dateOfBirth, setDateOfBirth] = useState('1994-06-15');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('100 Legal Tech Parkway');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('California');
  const [pincode, setPincode] = useState('94105');
  const [governmentIdType, setGovernmentIdType] = useState('PAN');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const idFormats = {
    PAN: 'ABCDE1234F (5 letters, 4 numbers, 1 letter)',
    VOTER_ID: 'ABC1234567 (3 letters, 7 numbers)',
    PASSPORT: 'A1234567 (1 letter, 7 numbers)',
    DRIVING_LICENSE: 'DL0120150012345 (2 letters, 2 numbers, 11 numbers)',
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
      await authService.submitKyc({
        dateOfBirth,
        gender,
        address,
        city,
        state,
        pincode,
        governmentIdType,
        governmentIdNumber,
      });

      toast.success('Identity verified successfully!');

      if (user?.role === 'LAWYER') {
        updateAccountStatus('PENDING_VERIFICATION');
        navigate('/lawyer/kyc/upload');
      } else {
        updateAccountStatus('ACTIVE');
        navigate('/client/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'KYC verification failed';
      setErrorMessage(msg);
      if (msg.includes('suspended') || msg.includes('duplicate')) {
        navigate('/suspended');
      } else if (msg.includes('18 years') || msg.includes('age')) {
        navigate('/disabled');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4 shadow-glow-purple">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Step 3: Identity &amp; KYC Verification</h2>
          <p className="mt-2 text-xs text-textSecondary">
            To prevent fraud and bots, all users must verify a valid government identity.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Type and Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Government ID Type
                </label>
                <select
                  value={governmentIdType}
                  onChange={(e) => {
                    setGovernmentIdType(e.target.value);
                    setGovernmentIdNumber('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                >
                  <option value="PAN">PAN Card</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  required
                  value={governmentIdNumber}
                  onChange={(e) => setGovernmentIdNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm uppercase font-mono focus:outline-none focus:border-accent"
                />
                <span className="text-[11px] text-textSecondary mt-1 block">
                  Format: {idFormats[governmentIdType]}
                </span>
              </div>
            </div>

            {/* DOB and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Identity &bull; Complete Registration</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitKyc;
