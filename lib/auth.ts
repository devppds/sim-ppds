import { cookies } from "next/headers";

export type AccessLevel = 'ROOT' | 'SEKRETARIAT' | 'KEUANGAN' | 'VIEW_ALL' | 'STAFF' | 'RESTRICTED_SPP';

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sim_ppds_session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) { return null; }
}

/**
 * Check module access
 */
export async function canAccess(module: 'SEKRETARIAT' | 'KEUANGAN' | 'PENGATURAN' | 'PUSAT_KONTROL') {
  const session = await getSession();
  if (!session) return false;

  const level = session.role_level as AccessLevel;
  if (level === 'ROOT') return true;
  
  if (module === 'SEKRETARIAT') {
    return level === 'SEKRETARIAT' || level === 'VIEW_ALL';
  }
  if (module === 'KEUANGAN') {
    return level === 'KEUANGAN' || level === 'RESTRICTED_SPP' || level === 'VIEW_ALL';
  }
  if (module === 'PENGATURAN') {
    return level === 'SEKRETARIAT'; // Khusus Sekretaris
  }
  if (module === 'PUSAT_KONTROL') {
    return false; // Root already handled at the top
  }

  return false;
}

/**
 * Check for Write access (POST, PUT, DELETE)
 */
export async function canWrite(module: 'SANTRI' | 'PENGURUS' | 'ALUMNI' | 'ASRAMA' | 'ARSIP' | 'KEUANGAN' | 'SYSTEM') {
  const session = await getSession();
  if (!session) return false;

  const level = session.role_level as AccessLevel;
  if (level === 'ROOT') return true;

  // Sekretaris CRUD
  if (['SANTRI', 'PENGURUS', 'ALUMNI', 'ASRAMA', 'ARSIP', 'SYSTEM'].includes(module)) {
    return level === 'SEKRETARIAT';
  }

  // Bendahara CRUD
  if (module === 'KEUANGAN') {
    return level === 'KEUANGAN' || level === 'RESTRICTED_SPP';
  }

  return false;
}
