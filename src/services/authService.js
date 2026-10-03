// Auth facade: uses Firebase Auth when configured, otherwise a local demo
// provider with the same API. User roles live in the profile store.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { db } from './db';
import { DEMO_CANDIDATE, DEMO_HR, DEMO_PASSWORD } from './seed';
import { uid } from '../utils/format';

const toUser = (profile) => ({
  uid: profile.uid,
  name: profile.name,
  email: profile.email,
  role: profile.role,
});

// ---------------- Firebase provider ----------------
const firebaseFriendlyError = (err) => {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/weak-password': 'Password is too weak.',
  };
  return new Error(map[err.code] || err.message);
};

const firebaseProvider = {
  async register({ name, email, password, role }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const profile = await db.saveProfile({ uid: cred.user.uid, name, email, role });
      return toUser(profile);
    } catch (err) {
      throw firebaseFriendlyError(err);
    }
  },
  async login({ email, password }) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return toUser(await resolveFirebaseProfile(cred.user));
    } catch (err) {
      throw firebaseFriendlyError(err);
    }
  },
  logout: () => signOut(auth),
  onChange(cb) {
    return onAuthStateChanged(auth, async (fbUser) => {
      cb(fbUser ? toUser(await resolveFirebaseProfile(fbUser)) : null);
    });
  },
};

async function resolveFirebaseProfile(fbUser) {
  const existing = await db.getProfile(fbUser.uid);
  if (existing) return existing;
  // First sign-in on this browser: default to candidate.
  return db.saveProfile({
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email.split('@')[0],
    email: fbUser.email,
    role: 'candidate',
  });
}

// ---------------- Local demo provider ----------------
const USERS_KEY = 'hireflow_demo_users';
const SESSION_KEY = 'hireflow_demo_session';
const EVENT = 'hireflow-auth-change';

const demoUsers = () => {
  const saved = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
  if (saved) return saved;
  const initial = [
    { ...DEMO_HR, password: DEMO_PASSWORD },
    { ...DEMO_CANDIDATE, password: DEMO_PASSWORD },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(initial));
  return initial;
};

const setSession = (user) => {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT));
};

const localProvider = {
  async register({ name, email, password, role }) {
    await new Promise((r) => setTimeout(r, 300));
    const users = demoUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const user = { uid: uid('user-'), name, email, role };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...user, password }]));
    await db.saveProfile(user);
    setSession(user);
    return user;
  },
  async login({ email, password }) {
    await new Promise((r) => setTimeout(r, 300));
    const found = demoUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) throw new Error('Incorrect email or password.');
    const user = toUser(found);
    setSession(user);
    return user;
  },
  async logout() {
    setSession(null);
  },
  onChange(cb) {
    const emit = () => cb(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'));
    emit();
    window.addEventListener(EVENT, emit);
    window.addEventListener('storage', emit);
    return () => {
      window.removeEventListener(EVENT, emit);
      window.removeEventListener('storage', emit);
    };
  },
};

export const authService = isFirebaseConfigured ? firebaseProvider : localProvider;
export const isDemoAuth = !isFirebaseConfigured;
