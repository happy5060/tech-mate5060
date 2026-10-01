import { Profile, UserRole } from '../../types/classroom';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_AUTH_USER = 'ai_classroom_current_user_v1';
const STORAGE_KEY_PROFILES = 'ai_classroom_profiles_v1';
const STORAGE_KEY_CREDENTIALS = 'ai_classroom_credentials_v1';

// --- Password hashing utility (SHA-256) ---
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Credential store (email → hashed password) ---
interface CredentialEntry {
  email: string;
  passwordHash: string;
  role: UserRole;
}

function getStoredCredentials(): CredentialEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCredentials(list: CredentialEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save credentials to localStorage:', e);
  }
}

// Seed initial profiles for administrative and teaching staff
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof-admin-1',
    role: 'admin',
    display_name: 'System Administrator',
    email: 'admin@school.edu',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString()
  }
];

function getStoredProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    return raw ? JSON.parse(raw) : INITIAL_PROFILES;
  } catch {
    return INITIAL_PROFILES;
  }
}

function saveStoredProfiles(list: Profile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save profiles to localStorage:', e);
  }
}

export const authService = {
  /**
   * Retrieves active authenticated user profile from memory/storage
   */
  getCurrentUser(): Profile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (raw) return JSON.parse(raw);
    } catch {}

    return null;
  },

  /**
   * Set the active user profile
   */
  setCurrentUser(user: Profile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  },

  /**
   * Get all registered profiles
   */
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getProfiles warning:', err);
      }
    }
    return getStoredProfiles();
  },

  /**
   * Authenticate with email & password.
   * - Admin: Can sign in with just email (flexible fallback for initial setup),
   *   or with email + password if Supabase Auth is configured.
   * - Teacher: MUST provide the password that was set by the admin during account creation.
   *   Teachers cannot self-register — only admin can create teacher accounts.
   */
  async signIn(email: string, password?: string, expectedRole?: UserRole): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase Auth is live and credentials given, authenticate with Supabase Auth
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!error && data.user) {
          // Fetch linked profile
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', data.user.id)
            .single();

          if (profData) {
            if (expectedRole && profData.role !== expectedRole) {
              await supabase.auth.signOut();
              throw new Error(`Account exists but does not have the '${expectedRole}' role.`);
            }
            this.setCurrentUser(profData);
            return profData;
          }
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('fetch')) {
          console.warn('Supabase auth attempt message:', err.message);
        }
      }
    }

    // 2. Local profile + credential verification
    const allProfiles = getStoredProfiles();
    const existing = allProfiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (expectedRole && existing.role !== expectedRole) {
        throw new Error(`This account is registered as '${existing.role}', not '${expectedRole}'.`);
      }
      if (existing.status === 'disabled') {
        throw new Error('This account has been deactivated. Please contact the administrator.');
      }

      // --- TEACHER PASSWORD VALIDATION ---
      // Teachers MUST authenticate with the password set by admin
      if (existing.role === 'teacher') {
        if (!password) {
          throw new Error('Password is required. Please enter the password provided by your administrator.');
        }

        const credentials = getStoredCredentials();
        const cred = credentials.find((c) => c.email === cleanEmail);

        if (!cred) {
          throw new Error('No credentials found for this account. Please contact the administrator to set your password.');
        }

        const inputHash = await hashPassword(password);
        if (inputHash !== cred.passwordHash) {
          throw new Error('Invalid password. Please check the password provided by your administrator.');
        }
      }

      // Admin with password — validate if credential exists, otherwise allow flexible login
      if (existing.role === 'admin' && password) {
        const credentials = getStoredCredentials();
        const cred = credentials.find((c) => c.email === cleanEmail);
        if (cred) {
          const inputHash = await hashPassword(password);
          if (inputHash !== cred.passwordHash) {
            throw new Error('Invalid administrator password.');
          }
        }
        // If no credential stored for admin, allow login (initial setup mode)
      }

      this.setCurrentUser(existing);
      return existing;
    }

    // 3. Auto-generate profile ONLY for admin role (teachers cannot self-register)
    if (expectedRole === 'teacher') {
      throw new Error('Teacher account not found. Only the Master Admin can create teacher accounts.');
    }

    const roleToAssign: UserRole = expectedRole || (cleanEmail.includes('admin') ? 'admin' : 'admin');
    const displayName = cleanEmail
      .split('@')[0]
      .split('.')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const newProfile: Profile = {
      id: `prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: roleToAssign,
      display_name: displayName,
      email: cleanEmail,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveStoredProfiles([newProfile, ...allProfiles]);
    this.setCurrentUser(newProfile);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert(newProfile);
      } catch {}
    }

    return newProfile;
  },

  /**
   * Register a new teacher profile with a password (Invoked by Master Admin).
   * The admin sets the teacher's password at creation time.
   * The password is hashed and stored in the local credential store.
   */
  async createTeacherAccount(data: {
    name: string;
    email: string;
    teacherCode: string;
    department?: string;
    password: string;
  }): Promise<Profile> {
    const cleanEmail = data.email.trim().toLowerCase();
    const all = getStoredProfiles();

    if (all.some((p) => p.email.toLowerCase() === cleanEmail)) {
      throw new Error(`A teacher account with email ${data.email} already exists.`);
    }

    if (!data.password || data.password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const newTeacher: Profile = {
      id: `prof-tch-${Date.now()}`,
      role: 'teacher',
      display_name: data.name.trim(),
      email: cleanEmail,
      teacher_code: data.teacherCode.trim().toUpperCase(),
      department: data.department || 'Curriculum & Instruction',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store the profile
    const updated = [newTeacher, ...all];
    saveStoredProfiles(updated);

    // Store the credential (hashed password)
    const passwordHash = await hashPassword(data.password);
    const credentials = getStoredCredentials();
    credentials.push({
      email: cleanEmail,
      passwordHash,
      role: 'teacher'
    });
    saveStoredCredentials(credentials);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert(newTeacher);
      } catch (err) {
        console.warn('Supabase createTeacherAccount profile insert warning:', err);
      }
    }

    return newTeacher;
  },

  /**
   * Update a teacher's password (Admin action)
   */
  async updateTeacherPassword(email: string, newPassword: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const passwordHash = await hashPassword(newPassword);
    const credentials = getStoredCredentials();
    const index = credentials.findIndex((c) => c.email === cleanEmail);

    if (index !== -1) {
      credentials[index].passwordHash = passwordHash;
    } else {
      credentials.push({ email: cleanEmail, passwordHash, role: 'teacher' });
    }

    saveStoredCredentials(credentials);
  },

  /**
   * Delete a teacher account permanently (Admin action)
   */
  async deleteTeacherAccount(profileIdOrEmail: string): Promise<void> {
    const list = getStoredProfiles();
    const cleanId = (profileIdOrEmail || '').trim();
    const cleanLower = cleanId.toLowerCase();

    // Match by ID or Email
    const teacher = list.find(
      (p) => (p.id && p.id === cleanId) || (p.email && p.email.toLowerCase() === cleanLower)
    );
    const teacherEmail = teacher?.email?.toLowerCase() || (cleanId.includes('@') ? cleanLower : null);

    // Remove profile from local store
    const updated = list.filter(
      (p) => p.id !== cleanId && (!teacherEmail || p.email?.toLowerCase() !== teacherEmail)
    );
    saveStoredProfiles(updated);

    // Remove credentials
    if (teacherEmail) {
      const credentials = getStoredCredentials();
      const updatedCreds = credentials.filter((c) => c.email.toLowerCase() !== teacherEmail);
      saveStoredCredentials(updatedCreds);
    }

    // Clear current user if this teacher was logged in
    const current = this.getCurrentUser();
    if (current && (current.id === cleanId || (teacherEmail && current.email?.toLowerCase() === teacherEmail))) {
      this.setCurrentUser(null);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', cleanId);
        if (error && teacherEmail) {
          await supabase.from('profiles').delete().eq('email', teacherEmail);
        }
      } catch (err) {
        console.warn('Supabase deleteTeacherAccount warning:', err);
      }
    }
  },

  /**
   * Toggle teacher active/disabled status
   */
  async toggleTeacherStatus(profileId: string): Promise<Profile | null> {
    const list = getStoredProfiles();
    const index = list.findIndex((p) => p.id === profileId);
    if (index === -1) return null;

    const current = list[index].status;
    const nextStatus = current === 'active' ? 'disabled' : 'active';
    list[index].status = nextStatus;
    list[index].updated_at = new Date().toISOString();
    saveStoredProfiles(list);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status: nextStatus, updated_at: list[index].updated_at })
          .eq('id', profileId);
      } catch (err) {
        console.warn('Supabase toggleTeacherStatus warning:', err);
      }
    }

    return list[index];
  },

  /**
   * Sign out current user
   */
  async signOut() {
    this.setCurrentUser(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
  }
};
