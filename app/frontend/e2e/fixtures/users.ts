export const USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@jobtech.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'password123',
    role: 'admin',
  },
  rh: {
    email: process.env.E2E_RH_EMAIL || 'rh@jobtech.com',
    password: process.env.E2E_RH_PASSWORD || 'password123',
    role: 'rh',
  },
  recruteur: {
    email: process.env.E2E_RECRUTEUR_EMAIL || 'recruteur@jobtech.com',
    password: process.env.E2E_RECRUTEUR_PASSWORD || 'password123',
    role: 'recruteur',
  },
  candidat: {
    email: process.env.E2E_CANDIDAT_EMAIL || 'candidat@jobtech.com',
    password: process.env.E2E_CANDIDAT_PASSWORD || 'password123',
    role: 'candidat',
  },
};
