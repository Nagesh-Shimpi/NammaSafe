import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';

export const DepartmentManagementView = () => {
  const { departments, officers, complaints } = useComplaints();
  const { lang } = useLanguage();

  const [deptList, setDeptList] = useState(departments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDept, setActiveDept] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields for Edit/Add
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slaDays: 7,
    nodalLead: '',
    category: 'Civic Infrastructure'
  });

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDepts = deptList.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.nameKn && d.nameKn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenEdit = (dept) => {
    setActiveDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      slaDays: dept.slaDays || 7,
      nodalLead: dept.nodalOfficer || 'Gazetted Nodal Engineer',
      category: dept.category || 'Civic Infrastructure'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeDept) return;

    setDeptList(prev => prev.map(d => {
      if (d.id === activeDept.id) {
        return {
          ...d,
          name: formData.name,
          code: formData.code,
          slaDays: Number(formData.slaDays),
          nodalOfficer: formData.nodalLead,
          category: formData.category
        };
      }
      return d;
    }));

    setIsEditModalOpen(false);
    showToast(`Department ${formData.code} parameters successfully updated.`);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const newId = `dept-${deptList.length + 1}`;
    const newDept = {
      id: newId,
      code: formData.code.toUpperCase(),
      name: formData.name,
      nameKn: formData.name,
      slaDays: Number(formData.slaDays),
      activeCases: 0,
      nodalOfficer: formData.nodalLead || 'Assigned Officer',
      compositeScore: 90,
      category: formData.category
    };

    setDeptList(prev => [newDept, ...prev]);
    setIsAddModalOpen(false);
    showToast(`New Ministry ${newDept.name} registered.`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="font-body text-body-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Department & Ministry Directory' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಇಲಾಖೆಗಳ ನಿರ್ವಹಣೆ ಮತ್ತು ಎಸ್‌ಎಲ್‌ಎ ಸಂರಚನೆ' : 'Department & Ministry Management'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Configure statutory redressal SLAs, cadre assignments, and grievance categories across all municipal ministries.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData({ name: '', code: '', slaDays: 7, nodalLead: '', category: 'Civic Infrastructure' });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">domain_add</span>
            Add Department
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Active Ministries</span>
          <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
            {deptList.length} Portfolios
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-semibold">100% Digital Workflow Active</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Average Mandated SLA</span>
          <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
            4.2 Days
          </div>
          <span className="font-mono text-[10px] text-secondary">Under Sakala Guarantee Act</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Total Nodal Cadre</span>
          <div className="font-headline text-headline-sm font-extrabold text-primary mt-1">
            {officers.length} Gazetted Leads
          </div>
          <span className="font-mono text-[10px] text-secondary">Assigned across zones</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Highest Composite Score</span>
          <div className="font-headline text-headline-sm font-extrabold text-emerald-700 mt-1">
            96.2 / 100
          </div>
          <span className="font-mono text-[10px] text-secondary">Urban Development Authority</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments by code, English or Kannada title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const deptComplaints = complaints.filter(c => c.departmentId === dept.id);
          const activeCases = deptComplaints.filter(c => ['SUBMITTED', 'IN_PROGRESS', 'OVERDUE'].includes(c.status)).length;
          const score = dept.compositeScore || 88;

          return (
            <div
              key={dept.id}
              className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary-container text-on-primary-container font-mono text-xs font-bold">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold text-on-surface">
                      {score}
                    </span>
                    <span className="font-mono text-[10px] text-secondary">/100</span>
                  </div>
                </div>

                <h3 className="font-headline text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  {dept.name}
                </h3>
                {dept.nameKn && (
                  <p className="font-body text-body-xs text-secondary mt-0.5">
                    {dept.nameKn}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col gap-2 font-body text-body-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Statutory SLA Window:</span>
                    <span className="font-mono font-bold text-on-surface">{dept.slaDays || 7} Days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Active Caseload:</span>
                    <span className="font-mono font-bold text-primary">{activeCases} tickets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Nodal In-Charge:</span>
                    <span className="font-body font-semibold text-on-surface truncate max-w-[140px]">
                      {dept.nodalOfficer || 'Executive Engineer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                  {dept.category || 'General'}
                </span>
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-body text-label-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Configure SLA
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit SLA Modal */}
      {isEditModalOpen && activeDept && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Configure Department: ${activeDept.name}`}
        >
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                  Statutory SLA (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.slaDays}
                  onChange={(e) => setFormData({ ...formData, slaDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Nodal Lead Officer Title
              </label>
              <input
                type="text"
                value={formData.nodalLead}
                onChange={(e) => setFormData({ ...formData, nodalLead: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container font-body text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold shadow-xs"
              >
                Update Department SLA
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Ministry Portfolio"
        >
          <form onSubmit={handleSaveAdd} className="flex flex-col gap-4">
            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Ministry / Department Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Department of Food and Civil Supplies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                  Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FCSD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                  Mandated SLA (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.slaDays}
                  onChange={(e) => setFormData({ ...formData, slaDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Domain Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Civic Infrastructure">Civic Infrastructure</option>
                <option value="Utilities & Energy">Utilities & Energy</option>
                <option value="Social Welfare & Security">Social Welfare & Security</option>
                <option value="Health & Sanitation">Health & Sanitation</option>
                <option value="Revenue & Land Administration">Revenue & Land Administration</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container font-body text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold shadow-xs"
              >
                Register Ministry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

