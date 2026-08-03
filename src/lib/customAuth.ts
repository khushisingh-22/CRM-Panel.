import { db, doc, getDoc, setDoc } from './firebase';

export interface CustomUser {
  uid: string;
  email: string;
  name?: string;
}

type AuthStateCallback = (user: CustomUser | null) => void;

class CustomAuthManager {
  private listeners: Set<AuthStateCallback> = new Set();
  private currentUser: CustomUser | null = null;
  private STORAGE_KEY = 'drwashit_crm_session';

  constructor() {
    // Initialize from localStorage on load
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved session', e);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  getCurrentUser(): CustomUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);
    // Emit current state immediately to the new listener
    callback(this.currentUser);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private emitStateChange() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentUser);
      } catch (e) {
        console.error('Error in auth state listener', e);
      }
    });
  }

  async createUserWithEmailAndPassword(email: string, password: string, name?: string): Promise<CustomUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const accountRef = doc(db, 'crm_accounts', cleanEmail);
    const docSnap = await getDoc(accountRef);

    if (docSnap.exists()) {
      throw new Error('An account with this email already exists.');
    }

    const uid = 'usr_' + Math.random().toString(36).substring(2, 15);
    const newUser: CustomUser = { uid, email: cleanEmail, name };

    // Save the credentials in Firestore (for private CRM, storing password simply is fine or we can hash it)
    await setDoc(accountRef, {
      uid,
      email: cleanEmail,
      password: password, // Simple plain-text password check since it's a private app, but fully cloud synced
      name: name || '',
      createdAt: new Date().toISOString()
    });

    this.currentUser = newUser;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));
    this.emitStateChange();

    return newUser;
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<CustomUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const accountRef = doc(db, 'crm_accounts', cleanEmail);
    const docSnap = await getDoc(accountRef);

    if (!docSnap.exists()) {
      throw new Error('No account found with this email. Please sign up.');
    }

    const accountData = docSnap.data();
    if (accountData.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const user: CustomUser = {
      uid: accountData.uid,
      email: accountData.email,
      name: accountData.name
    };

    this.currentUser = user;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.emitStateChange();

    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    this.emitStateChange();
  }
}

export const customAuth = new CustomAuthManager();
