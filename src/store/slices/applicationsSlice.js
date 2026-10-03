import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { db } from '../../services/db';
import { PIPELINE } from '../../utils/constants';
import { uid } from '../../utils/format';

export const fetchApplications = createAsyncThunk('applications/fetch', () => db.getApplications());

export const applyToJob = createAsyncThunk('applications/apply', (payload, { rejectWithValue }) =>
  db.createApplication(payload).catch((e) => rejectWithValue(e.message)),
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }, { getState }) => {
    const app = getState().applications.items.find((a) => a.id === id);
    return db.updateApplication(id, {
      status,
      history: [...app.history, { status, at: new Date().toISOString() }],
    });
  },
);

export const saveHrNotes = createAsyncThunk('applications/saveNotes', ({ id, hrNotes }) =>
  db.updateApplication(id, { hrNotes }),
);

// Assigning an interview round moves an early-stage applicant to "Interview".
export const assignRound = createAsyncThunk('applications/assignRound', async ({ id, round }, { getState }) => {
  const app = getState().applications.items.find((a) => a.id === id);
  const patch = { rounds: [...app.rounds, { ...round, id: uid('round-'), status: 'Scheduled', feedback: '' }] };
  if (PIPELINE.indexOf(app.status) > -1 && PIPELINE.indexOf(app.status) < PIPELINE.indexOf('Interview')) {
    patch.status = 'Interview';
    patch.history = [...app.history, { status: 'Interview', at: new Date().toISOString() }];
  }
  return db.updateApplication(id, patch);
});

export const updateRound = createAsyncThunk(
  'applications/updateRound',
  async ({ id, roundId, patch }, { getState }) => {
    const app = getState().applications.items.find((a) => a.id === id);
    return db.updateApplication(id, {
      rounds: app.rounds.map((r) => (r.id === roundId ? { ...r, ...patch } : r)),
    });
  },
);

export const removeRound = createAsyncThunk('applications/removeRound', async ({ id, roundId }, { getState }) => {
  const app = getState().applications.items.find((a) => a.id === id);
  return db.updateApplication(id, { rounds: app.rounds.filter((r) => r.id !== roundId) });
});

const upsert = (state, action) => {
  const i = state.items.findIndex((a) => a.id === action.payload.id);
  if (i === -1) state.items.unshift(action.payload);
  else state.items[i] = action.payload;
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(applyToJob.fulfilled, upsert)
      .addCase(updateApplicationStatus.fulfilled, upsert)
      .addCase(saveHrNotes.fulfilled, upsert)
      .addCase(assignRound.fulfilled, upsert)
      .addCase(updateRound.fulfilled, upsert)
      .addCase(removeRound.fulfilled, upsert)
      .addCase('jobs/delete/fulfilled', (state, action) => {
        state.items = state.items.filter((a) => a.jobId !== action.payload);
      });
  },
});

export const selectApplications = (s) => s.applications.items;
export const selectApplicationById = (id) => (s) => s.applications.items.find((a) => a.id === id);

export const selectMyApplications = createSelector(
  [selectApplications, (s) => s.auth.user?.uid],
  (apps, userId) => apps.filter((a) => a.candidateId === userId),
);

export const selectApplicationCountsByJob = createSelector([selectApplications], (apps) =>
  apps.reduce((acc, a) => ({ ...acc, [a.jobId]: (acc[a.jobId] || 0) + 1 }), {}),
);

export default applicationsSlice.reducer;
