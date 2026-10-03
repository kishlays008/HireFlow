// A small async data layer backed by localStorage. Every method returns a
// Promise so it can be swapped for Firestore (or a REST API) without touching
// the Redux slices or UI.
import { seedApplicants, seedJobs, DEMO_CANDIDATE, DEMO_HR } from './seed';
import { makeSampleResumePdf } from '../utils/samplePdf';
import { uid } from '../utils/format';

const DB_KEY = 'hireflow_db_v1';
const RESUME_PREFIX = 'hireflow_resume_';
const latency = () => new Promise((r) => setTimeout(r, 200));

function seed() {
  const data = {
    jobs: seedJobs,
    applications: seedApplicants.map((a) => ({
      ...a,
      resumeName: `${a.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      resumeSize: 1200,
    })),
    profiles: {
      [DEMO_HR.uid]: DEMO_HR,
      [DEMO_CANDIDATE.uid]: DEMO_CANDIDATE,
    },
  };
  seedApplicants.forEach((a) => {
    localStorage.setItem(RESUME_PREFIX + a.id, makeSampleResumePdf(a.fullName, `Applicant · ${a.experienceYears} yrs experience`));
  });
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  return data;
}

function read() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch {
    return seed();
  }
}

function write(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function notFound(what) {
  return new Error(`${what} not found`);
}

export const db = {
  // ---------- Jobs ----------
  async getJobs() {
    await latency();
    return read().jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createJob(job) {
    await latency();
    const data = read();
    const created = { ...job, id: uid('job-'), createdAt: new Date().toISOString() };
    data.jobs.unshift(created);
    write(data);
    return created;
  },

  async updateJob(id, patch) {
    await latency();
    const data = read();
    const idx = data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw notFound('Job');
    data.jobs[idx] = { ...data.jobs[idx], ...patch, updatedAt: new Date().toISOString() };
    write(data);
    return data.jobs[idx];
  },

  async deleteJob(id) {
    await latency();
    const data = read();
    data.jobs = data.jobs.filter((j) => j.id !== id);
    data.applications
      .filter((a) => a.jobId === id)
      .forEach((a) => localStorage.removeItem(RESUME_PREFIX + a.id));
    data.applications = data.applications.filter((a) => a.jobId !== id);
    write(data);
    return id;
  },

  // ---------- Applications ----------
  async getApplications() {
    await latency();
    return read().applications.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  },

  async createApplication({ resumeDataUrl, ...application }) {
    await latency();
    const data = read();
    if (data.applications.some((a) => a.jobId === application.jobId && a.candidateId === application.candidateId)) {
      throw new Error('You have already applied for this job');
    }
    const now = new Date().toISOString();
    const created = {
      ...application,
      id: uid('app-'),
      status: 'Applied',
      appliedAt: now,
      history: [{ status: 'Applied', at: now }],
      rounds: [],
      hrNotes: '',
    };
    try {
      localStorage.setItem(RESUME_PREFIX + created.id, resumeDataUrl);
    } catch {
      throw new Error('Browser storage is full. Try a smaller PDF or reset demo data.');
    }
    data.applications.unshift(created);
    write(data);
    return created;
  },

  async updateApplication(id, patch) {
    await latency();
    const data = read();
    const idx = data.applications.findIndex((a) => a.id === id);
    if (idx === -1) throw notFound('Application');
    data.applications[idx] = { ...data.applications[idx], ...patch, updatedAt: new Date().toISOString() };
    write(data);
    return data.applications[idx];
  },

  getResume(applicationId) {
    return localStorage.getItem(RESUME_PREFIX + applicationId);
  },

  // ---------- Profiles (stores the user's role) ----------
  async getProfile(userId) {
    return read().profiles[userId] || null;
  },

  async saveProfile(profile) {
    const data = read();
    data.profiles[profile.uid] = profile;
    write(data);
    return profile;
  },

  reset() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(RESUME_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    seed();
  },
};
