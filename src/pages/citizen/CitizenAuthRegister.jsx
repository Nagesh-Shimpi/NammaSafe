import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { DISTRICTS_LIST } from '../../data/departmentsData';

export const CitizenAuthRegister = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhaar: '',
    district: DISTRICTS_LIST[0],
    address: ''
  });

  const [registered, setRegistered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistered(true);
    setTimeout(() => {
      navigate('/citizen/login');
    }, 2000);
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl">how_to_reg</span>
          </div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            {lang === 'kn' ? 'ಹೊಸ ನಾಗರಿಕ ನೋಂದಣಿ' : 'Register Citizen Account'}
          </h1>
          <p className="font-body text-body-sm text-secondary mt-1">
            Create a profile to enjoy automatic complaint tracking, SMS alerts, and fast verification.
          </p>
        </div>

        {registered && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-body-sm text-center font-bold">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunil Mehta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98450 12345"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md font-mono"
              />
            </div>
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Aadhaar (Optional)
              </label>
              <input
                type="text"
                placeholder="XXXX-XXXX-1234"
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
              District
            </label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md cursor-pointer"
            >
              {DISTRICTS_LIST.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
              Street / Residential Address
            </label>
            <textarea
              rows={2}
              placeholder="e.g. #14, 5th Cross, Malleshwaram"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-body-md"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all mt-2"
          >
            Create Citizen Profile
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-secondary font-body">
          Already registered?{' '}
          <Link to="/citizen/login" className="text-primary font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

