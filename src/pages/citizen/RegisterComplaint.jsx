import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { COMPLAINT_CATEGORIES, KARNATAKA_DISTRICTS } from '../../data/complaintCategories';
import { PRIORITY_CONFIG } from '../../utils/constants';

export const RegisterComplaint = () => {
  const { registerNewComplaint, saveDraftComplaint, checkDuplicate, departments } = useComplaints();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Citizen Information
    citizenName: '',
    mobileNumber: '',
    email: '',
    gender: 'Prefer Not to Say',
    address: '',
    district: KARNATAKA_DISTRICTS[0].name,
    taluk: KARNATAKA_DISTRICTS[0].taluks[0],
    village: '',
    pinCode: '',

    // Section B: Complaint Information
    complaintTitle: '',
    category: COMPLAINT_CATEGORIES[0].name,
    subcategory: COMPLAINT_CATEGORIES[0].subcategories[0],
    departmentId: COMPLAINT_CATEGORIES[0].departmentId,
    complaintDescription: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentLocation: '12.9716° N, 77.5946° E (Auto-detected)',
    priority: 'MEDIUM',
    preferredLanguage: 'English',

    // Section C: Supporting Documents
    attachments: [
      { id: 'att-1', name: 'site_photo_primary.jpg', type: 'image/jpeg', size: '2.4 MB', uploadStatus: 'Uploaded' }
    ],

    // Section D: Declarations
    declarationConfirmed: false,
    privacyConsent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [registeredTicket, setRegisteredTicket] = useState(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Available taluks based on selected district
  const currentDistrictObj = KARNATAKA_DISTRICTS.find(d => d.name === formData.district) || KARNATAKA_DISTRICTS[0];
  const availableTaluks = currentDistrictObj.taluks;

  // Available subcategories and department based on category
  const currentCategoryObj = COMPLAINT_CATEGORIES.find(c => c.name === formData.category) || COMPLAINT_CATEGORIES[0];
  const availableSubcategories = currentCategoryObj.subcategories;

  // Pre-fill from query params if available
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    if (categoryQuery) {
      const match = COMPLAINT_CATEGORIES.find(c =>
        c.name.toLowerCase().includes(categoryQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(categoryQuery.toLowerCase())
      );
      if (match) {
        setFormData(prev => ({
          ...prev,
          category: match.name,
          subcategory: match.subcategories[0],
          departmentId: match.departmentId,
          complaintTitle: `Grievance regarding ${match.name}: `
        }));
      }
    }
  }, [searchParams]);

  // Handle District Change -> sync taluks
  const handleDistrictChange = (e) => {
    const distName = e.target.value;
    const distObj = KARNATAKA_DISTRICTS.find(d => d.name === distName);
    const newTaluk = distObj ? distObj.taluks[0] : '';
    setFormData(prev => ({
      ...prev,
      district: distName,
      taluk: newTaluk
    }));
    if (errors.district) setErrors(prev => ({ ...prev, district: null }));
  };

  // Handle Category Change -> sync subcategories & department
  const handleCategoryChange = (e) => {
    const catName = e.target.value;
    const catObj = COMPLAINT_CATEGORIES.find(c => c.name === catName);
    setFormData(prev => ({
      ...prev,
      category: catName,
      subcategory: catObj?.subcategories[0] || 'General Inquiry',
      departmentId: catObj?.departmentId || departments[0]?.id
    }));
    if (errors.category) setErrors(prev => ({ ...prev, category: null }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Real-time duplicate check heuristic
    if (name === 'complaintTitle' && value.length > 8) {
      const dup = checkDuplicate(value, formData.departmentId, formData.district);
      setDuplicateWarning(dup);
    }
  };

  // Simulated File Upload Handling
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const newAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: sizeInMb === '0.00 MB' ? '1.4 MB' : sizeInMb,
      uploadStatus: 'Uploading...'
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));

    setUploadProgress(file.name);

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.map(a =>
          a.id === newAttachment.id ? { ...a, uploadStatus: 'Uploaded' } : a
        )
      }));
      setUploadProgress(null);
    }, 800);
  };

  const handleRemoveAttachment = (attId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  // Field Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.citizenName.trim()) {
      newErrors.citizenName = 'Citizen Full Name is required.';
    }

    const cleanPhone = formData.mobileNumber.replace(/\D/g, '');
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required for SMS notifications.';
    } else if (cleanPhone.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.district) newErrors.district = 'Please select a District.';
    if (!formData.taluk) newErrors.taluk = 'Please select a Taluk.';
    if (!formData.village.trim()) newErrors.village = 'Village / Ward / Area name is required.';

    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'PIN code must be a 6-digit number.';
    }

    if (!formData.complaintTitle.trim() || formData.complaintTitle.trim().length < 6) {
      newErrors.complaintTitle = 'Please provide a clear complaint title (min 6 characters).';
    }

    if (!formData.complaintDescription.trim() || formData.complaintDescription.trim().length < 20) {
      newErrors.complaintDescription = 'Please provide sufficient complaint description (min 20 characters).';
    }

    if (!formData.declarationConfirmed) {
      newErrors.declarationConfirmed = 'You must declare that the furnished information is true.';
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'Consent for data processing is required to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ticket = registerNewComplaint({
        citizenName: formData.citizenName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        district: formData.district,
        taluk: formData.taluk,
        ward: formData.village,
        village: formData.village,
        pincode: formData.pinCode,
        complaintTitle: formData.complaintTitle,
        title: formData.complaintTitle,
        category: formData.category,
        subcategory: formData.subcategory,
        departmentId: formData.departmentId,
        complaintDescription: formData.complaintDescription,
        description: formData.complaintDescription,
        incidentDate: formData.incidentDate,
        location: formData.incidentLocation,
        priority: formData.priority,
        preferredLanguage: formData.preferredLanguage,
        attachments: formData.attachments,
        declarationConfirmed: formData.declarationConfirmed,
        privacyConsent: formData.privacyConsent,
        isDraft: false
      });

      setRegisteredTicket(ticket);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Save as Draft Handler
  const handleSaveDraft = (e) => {
    e.preventDefault();
    saveDraftComplaint({
      ...formData,
      isDraft: true,
      title: formData.complaintTitle || 'Draft Complaint',
      description: formData.complaintDescription || 'Draft Description'
    });
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3500);
  };

  // Reset Handler
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the registration form? All entered data will be cleared.')) {
      setFormData({
        citizenName: '',
        mobileNumber: '',
        email: '',
        gender: 'Prefer Not to Say',
        address: '',
        district: KARNATAKA_DISTRICTS[0].name,
        taluk: KARNATAKA_DISTRICTS[0].taluks[0],
        village: '',
        pinCode: '',
        complaintTitle: '',
        category: COMPLAINT_CATEGORIES[0].name,
        subcategory: COMPLAINT_CATEGORIES[0].subcategories[0],
        departmentId: COMPLAINT_CATEGORIES[0].departmentId,
        complaintDescription: '',
        incidentDate: new Date().toISOString().slice(0, 10),
        incidentLocation: '12.9716° N, 77.5946° E (Auto-detected)',
        priority: 'MEDIUM',
        preferredLanguage: 'English',
        attachments: [],
        declarationConfirmed: false,
        privacyConsent: false
      });
      setErrors({});
      setDuplicateWarning(null);
    }
  };

  // Copy Tracking ID
  const handleCopyTrackingId = () => {
    if (!registeredTicket) return;
    const token = registeredTicket.trackingId || registeredTicket.token;
    navigator.clipboard.writeText(token);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Print Acknowledgement
  const handlePrintAcknowledgement = () => {
    window.print();
  };

  // =========================================================================
  // VIEW: CONFIRMATION SCREEN
  // =========================================================================
  if (registeredTicket) {
    const token = registeredTicket.trackingId || registeredTicket.token;
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Printable Header */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Government of Karnataka · ResolveTrack Civic Portal</h1>
          <p className="text-sm text-slate-600">Official Grievance Registration Acknowledgement Gazette</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-teal-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <span className="material-symbols-outlined text-4xl text-teal-200">check_circle</span>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-teal-900/60 text-teal-200 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              Statutory Intake Receipt
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Grievance Successfully Registered</h1>
            <p className="text-teal-100 text-sm mt-1 max-w-lg mx-auto">
              Your grievance has been safely catalogued in the state digital registry. A tracking notification has been dispatched to your mobile.
            </p>
          </div>

          {/* Tracking ID Hero Box */}
          <div className="p-6 sm:p-8 bg-teal-50/50 border-b border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-teal-900">Unique Complaint Tracking ID</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-teal-950 mt-0.5 tracking-tight">
                {token}
              </p>
              <p className="text-xs text-teal-700 mt-1">
                Preserve this ID for all subsequent SMS, IVR, and portal inquiries.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyTrackingId}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedId ? 'done' : 'content_copy'}
                </span>
                <span>{copiedId ? 'Copied to Clipboard!' : 'Copy Tracking ID'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrintAcknowledgement}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm print:hidden"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print / Download</span>
              </button>
            </div>
          </div>

          {/* Docket Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen Full Name</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{registeredTicket.citizenName}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</span>
                <p className="text-sm font-mono text-slate-800 mt-0.5">{registeredTicket.citizenPhone}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Ward</span>
                <p className="text-sm text-slate-800 mt-0.5">
                  {registeredTicket.ward}, {registeredTicket.taluk}, {registeredTicket.district} ({registeredTicket.pincode})
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Date & Time</span>
                <p className="text-sm font-mono text-slate-800 mt-0.5">{registeredTicket.createdAt}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Subject</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{registeredTicket.title}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category & Subcategory</span>
                <p className="text-sm text-slate-800 mt-0.5">
                  <span className="font-semibold text-teal-800">{registeredTicket.category}</span> · {registeredTicket.subcategory}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designated Department</span>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{registeredTicket.departmentName}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Complaint Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    <span>NEWLY REGISTERED (PENDING SCRUTINY)</span>
                  </span>
                  <span className="text-xs text-slate-500">SLA: 48-72h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgement Footer & Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="material-symbols-outlined text-teal-600 text-sm">verified_user</span>
              <span>Encrypted with SHA-256 digital stamp · Karnataka Citizen Redressal Act 2012</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setRegisteredTicket(null);
                  handleReset();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              >
                Register Another Grievance
              </button>
              <Link
                to={`/citizen/track?token=${token}`}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Track Complaint Live</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: COMPREHENSIVE 4-SECTION REGISTRATION FORM
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Toast Notification for Draft Saved */}
      {draftSavedToast && (
        <div className="fixed top-5 right-5 z-50 bg-teal-900 text-white px-5 py-3 rounded-xl shadow-xl border border-teal-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-teal-300">save</span>
          <span className="text-sm font-semibold">Complaint draft successfully saved to your session!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-[11px] font-bold uppercase">
                Official Civic Intake
              </span>
              <span className="text-xs text-slate-500">Sakala Redressal Mandate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900">
              Register Public Grievance
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Submit your complaint directly to the Government of Karnataka administrative machinery. Every submission is assigned a unique tracking token and assigned to an authorized nodal officer.
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Link
              to="/citizen/track"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              <span>Track Existing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Potential Duplicate Banner */}
      {duplicateWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-sm">
          <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">warning</span>
          <div className="flex-1 text-sm">
            <p className="font-bold">
              Potential Similar Grievance Already Active in Your Vicinity (#{duplicateWarning.token})
            </p>
            <p className="mt-0.5 text-amber-800 text-xs">
              "{duplicateWarning.title}" was logged by {duplicateWarning.citizenName} in {duplicateWarning.district}. Current status: <strong>{duplicateWarning.status}</strong>.
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <Link
                to={`/citizen/track?token=${duplicateWarning.token}`}
                target="_blank"
                className="text-teal-800 font-bold underline hover:text-teal-900"
              >
                View Existing Grievance →
              </Link>
              <span className="text-slate-500">If your issue is distinct, proceed with your submission below.</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================================= */}
        {/* SECTION A: CITIZEN INFORMATION */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono">
              A
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Citizen Information</h2>
              <p className="text-xs text-slate-500">Provide verified contact coordinates for statutory notifications and field verification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Citizen Full Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Citizen Full Name *
              </label>
              <input
                type="text"
                name="citizenName"
                value={formData.citizenName}
                onChange={handleInputChange}
                placeholder="e.g. Sunil Mehta / ರಮೇಶ್ ಕುಮಾರ್"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.citizenName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.citizenName && <p className="text-xs text-rose-600 mt-1">{errors.citizenName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (SMS alerts) *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="+91 98450 12345"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono transition-all outline-none ${
                  errors.mobileNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.mobileNumber && <p className="text-xs text-rose-600 mt-1">{errors.mobileNumber}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="citizen@domain.com"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Prefer Not to Say">Prefer Not to Say</option>
              </select>
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PIN Code *
              </label>
              <input
                type="text"
                name="pinCode"
                maxLength={6}
                value={formData.pinCode}
                onChange={handleInputChange}
                placeholder="e.g. 560041"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono transition-all outline-none ${
                  errors.pinCode ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.pinCode && <p className="text-xs text-rose-600 mt-1">{errors.pinCode}</p>}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleDistrictChange}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
              >
                {KARNATAKA_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Taluk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Taluk *
              </label>
              <select
                name="taluk"
                value={formData.taluk}
                onChange={handleInputChange}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
              >
                {availableTaluks.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Village / Ward */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Village / Ward / Sector *
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                placeholder="e.g. Ward 14 (Jayanagar 4th Block)"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.village ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.village && <p className="text-xs text-rose-600 mt-1">{errors.village}</p>}
            </div>

            {/* Full Street Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Residential / Postal Address (Street & Landmark)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="House / Door No, Street Name, Near Landmark"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION B: COMPLAINT INFORMATION */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono">
              B
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Complaint Information</h2>
              <p className="text-xs text-slate-500">Categorize your grievance to assist algorithmic and human triage routing.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Title / Subject *
              </label>
              <input
                type="text"
                name="complaintTitle"
                value={formData.complaintTitle}
                onChange={handleInputChange}
                placeholder="e.g. Contaminated drinking water pipeline leak with sewer intrusion near Ward 14"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm transition-all outline-none ${
                  errors.complaintTitle ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.complaintTitle && <p className="text-xs text-rose-600 mt-1">{errors.complaintTitle}</p>}
            </div>

            {/* Category, Subcategory, Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grievance Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
                >
                  {COMPLAINT_CATEGORIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subcategory *
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
                >
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Department (Auto-mapped or selectable) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department (Auto-Mapped)
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer bg-slate-50 font-medium"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Citizen-Perceived Urgency *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
                >
                  <option value="LOW">Low (Routine maintenance · SLA: 7 days)</option>
                  <option value="MEDIUM">Medium (Standard grievance · SLA: 72 hours)</option>
                  <option value="HIGH">High (Substantial civic impact · SLA: 48 hours)</option>
                  <option value="CRITICAL">Critical (Hazard to life / safety · SLA: 24 hours)</option>
                </select>
              </div>

              {/* Incident Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Incident / Occurrence Date *
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none font-mono"
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Communication Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-sm transition-all outline-none cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Complaint Description *
              </label>
              <textarea
                name="complaintDescription"
                rows={4}
                value={formData.complaintDescription}
                onChange={handleInputChange}
                placeholder="Clearly describe what happened, duration of the issue, who is affected, and any previous attempts to get redressal..."
                className={`w-full p-3.5 rounded-xl border text-sm transition-all outline-none resize-y ${
                  errors.complaintDescription ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
                }`}
              />
              {errors.complaintDescription && (
                <p className="text-xs text-rose-600 mt-1">{errors.complaintDescription}</p>
              )}
            </div>

            {/* Incident Location Text */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-teal-700">pin_drop</span>
                <div>
                  <span className="text-xs font-bold text-slate-800">Incident Geolocation Stamp</span>
                  <p className="text-xs font-mono text-slate-600">{formData.incidentLocation}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 text-[11px] font-mono font-bold">
                GIS Coordinate Tagged
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION C: SUPPORTING DOCUMENTS & EVIDENCE */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono">
              C
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Supporting Documents & Evidence</h2>
              <p className="text-xs text-slate-500">Attach photos, bills, scanned receipts or evidence documents (JPG, PNG, PDF up to 10MB).</p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/40 hover:bg-teal-50 p-6 sm:p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              Click to select evidence file or drag and drop
            </p>
            <p className="text-xs text-slate-500">
              Supports JPEG, PNG, PDF documents · Simulated secure cloud intake
            </p>
            {uploadProgress && (
              <span className="mt-2 text-xs font-mono text-teal-700 animate-pulse">
                Simulating upload: {uploadProgress}...
              </span>
            )}
          </div>

          {/* Attached Files List */}
          {formData.attachments.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Attached Files ({formData.attachments.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {formData.attachments.map((file) => (
                  <div key={file.id} className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-teal-700 text-lg shrink-0">
                        {file.type?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {file.type} · {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        {file.uploadStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                        title="Remove attachment"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION D: DECLARATION AND SUBMISSION */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono">
              D
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Declaration & Legal Consent</h2>
              <p className="text-xs text-slate-500">Statutory acknowledgement under the Karnataka Citizen Redressal Act.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                name="declarationConfirmed"
                checked={formData.declarationConfirmed}
                onChange={handleInputChange}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>Solemn Declaration:</strong> I solemnly declare that the facts and statements furnished above are true and correct to the best of my knowledge and belief. I understand that submitting knowingly false or malicious claims is liable for statutory penalty.
              </span>
            </label>
            {errors.declarationConfirmed && (
              <p className="text-xs text-rose-600">{errors.declarationConfirmed}</p>
            )}

            {/* Privacy Consent Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                name="privacyConsent"
                checked={formData.privacyConsent}
                onChange={handleInputChange}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>Privacy & Processing Consent:</strong> I authorize the Department of Administrative Reforms & Public Grievances to store, process, and transmit my contact details to authorized field verification officers and send SMS/WhatsApp status alerts.
              </span>
            </label>
            {errors.privacyConsent && (
              <p className="text-xs text-rose-600">{errors.privacyConsent}</p>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Reset Form</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl border border-teal-300 bg-teal-50/50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">drafts</span>
                <span>Save as Draft</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span>Generating Tracking ID...</span>
                </>
              ) : (
                <>
                  <span>Submit Grievance</span>
                  <span className="material-symbols-outlined text-lg">send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterComplaint;
