import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext();

const ROLE_PROFILES = {
  [USER_ROLES.ADMIN]: {
    name: 'Dr. Rajeshwar Varma',
    title: 'Chief Grievance Commissioner',
    role: USER_ROLES.ADMIN,
    department: 'Central Grievance Redressal Authority',
    badge: 'ADM-001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    email: 'commissioner@resolvetrack.gov.in',
    defaultRoute: '/admin/overview'
  },
  [USER_ROLES.SUPERVISOR]: {
    name: 'Smt. Gayatri Devi, IAS',
    title: 'District Magistrate & Zonal Ombudsman',
    role: USER_ROLES.SUPERVISOR,
    department: 'Apex Governance & Vigilance Directorate',
    badge: 'IAS-8902',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    email: 'dm.oversight@resolvetrack.gov.in',
    defaultRoute: '/supervisor/escalations'
  },
  [USER_ROLES.OFFICER]: {
    name: 'Er. Sandeep Kulkarni',
    title: 'Senior Executive Nodal Engineer',
    role: USER_ROLES.OFFICER,
    department: 'Ministry of Jal Shakti (Water Ops)',
    badge: 'GAZ-9014',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    email: 'sandeep.k@jalshakti.gov.in',
    defaultRoute: '/officer/dashboard'
  },
  [USER_ROLES.CITIZEN]: {
    name: 'Sunil Mehta',
    title: 'Registered Resident (Aadhaar Verified)',
    role: USER_ROLES.CITIZEN,
    department: 'Citizen Portal Access',
    badge: 'UID-****-8812',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    email: 'sunil.mehta.res@gmail.com',
    defaultRoute: '/citizen'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('resolvetrack_role') || USER_ROLES.ADMIN;
  });

  const currentUser = ROLE_PROFILES[currentRole] || ROLE_PROFILES[USER_ROLES.ADMIN];

  const switchRole = (newRole) => {
    if (ROLE_PROFILES[newRole]) {
      setCurrentRole(newRole);
      localStorage.setItem('resolvetrack_role', newRole);
    }
  };

  return (
    <AuthContext.Provider value={{ currentRole, currentUser, switchRole, USER_ROLES, ROLE_PROFILES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

