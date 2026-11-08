import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CitizenLogin = () => {
  const { switchRole, USER_ROLES } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [mobileOrAadhaar, setMobileOrAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobileOrAadhaar.trim()) return;
    setOtpSent(true);
    setOtp('9014'); // Simulated demo OTP
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    switchRole(USER_ROLES.CITIZEN);
    navigate('/citizen/track');
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            {lang === 'kn' ? 'ನಾಗರಿಕ ಲಾಗಿನ್' : 'Citizen Portal Sign In'}
          </h1>
          <p className="font-body text-body-sm text-secondary mt-1">
            Sign in using your mobile number or Aadhaar-linked OTP to track grievances and verify resolutions.
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
                Registered Mobile Number or Aadhaar
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98402 11928 / XXXX-8812"
                value={mobileOrAadhaar}
                onChange={(e) => setMobileOrAadhaar(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all"
            >
              Send Verification OTP (Demo)
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono">
              Demo OTP sent to {mobileOrAadhaar}: <strong>9014</strong>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1.5">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 text-center text-2xl font-mono font-bold tracking-widest rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all"
            >
              Verify OTP & Access Portal
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-outline-variant/20 text-center text-xs text-secondary font-body flex flex-col gap-2">
          <div>
            Don't have a registered account?{' '}
            <Link to="/citizen/register-account" className="text-primary font-bold hover:underline">
              Create Citizen Profile
            </Link>
          </div>
          <div>
            Or directly{' '}
            <Link to="/citizen/register" className="text-primary font-bold hover:underline">
              Submit Grievance Without Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

