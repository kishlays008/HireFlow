import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { db } from '../../services/db';

export const fetchJobs = createAsyncThunk('jobs/fetch', () => db.getJobs());
export const createJob = createAsyncThunk('jobs/create', (job) => db.createJob(job));
export const updateJob = createAsyncThunk('jobs/update', ({ id, patch }) => db.updateJob(id, patch));
export const deleteJob = createAsyncThunk('jobs/delete', (id) => db.deleteJob(id));

export const defaultJobFilters = {
  search: '',
  department: '',
  location: '',
  type: '',
  workMode: '',
  experience: '',
  sort: 'newest',
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    filters: defaultJobFilters,
  },
  reducers: {
    setJobFilter(state, action) {
      Object.assign(state.filters, action.payload);
    },
    resetJobFilters(state) {
      state.filters = defaultJobFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const i = state.items.findIndex((j) => j.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((j) => j.id !== action.payload);
      });
  },
});

export const { setJobFilter, resetJobFilters } = jobsSlice.actions;

export const selectJobs = (s) => s.jobs.items;
export const selectJobFilters = (s) => s.jobs.filters;
export const selectJobById = (id) => (s) => s.jobs.items.find((j) => j.id === id);

export const selectFilteredOpenJobs = createSelector([selectJobs, selectJobFilters], (jobs, f) => {
  const q = f.search.trim().toLowerCase();
  const list = jobs.filter(
    (j) =>
      j.status === 'Open' &&
      (!q ||
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))) &&
      (!f.department || j.department === f.department) &&
      (!f.location || j.location === f.location) &&
      (!f.type || j.type === f.type) &&
      (!f.workMode || j.workMode === f.workMode) &&
      (!f.experience || j.experience === f.experience),
  );
  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    salary: (a, b) => (b.salaryMax || 0) - (a.salaryMax || 0),
    deadline: (a, b) => a.deadline.localeCompare(b.deadline),
  };
  return [...list].sort(sorters[f.sort] || sorters.newest);
});

export const selectJobLocations = createSelector([selectJobs], (jobs) =>
  [...new Set(jobs.map((j) => j.location))].sort(),
);

export default jobsSlice.reducer;
