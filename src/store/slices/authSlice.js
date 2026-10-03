import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const login = createAsyncThunk('auth/login', (credentials, { rejectWithValue }) =>
  authService.login(credentials).catch((e) => rejectWithValue(e.message)),
);

export const register = createAsyncThunk('auth/register', (details, { rejectWithValue }) =>
  authService.register(details).catch((e) => rejectWithValue(e.message)),
);

export const logout = createAsyncThunk('auth/logout', () => authService.logout());

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    initialized: false, // true once the auth listener has reported at least once
    status: 'idle',
    error: null,
  },
  reducers: {
    authStateChanged(state, action) {
      state.user = action.payload;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addMatcher(
        (a) => [login.pending.type, register.pending.type].includes(a.type),
        (state) => {
          state.status = 'loading';
          state.error = null;
        },
      )
      .addMatcher(
        (a) => [login.fulfilled.type, register.fulfilled.type].includes(a.type),
        (state, action) => {
          state.status = 'idle';
          state.user = action.payload;
        },
      )
      .addMatcher(
        (a) => [login.rejected.type, register.rejected.type].includes(a.type),
        (state, action) => {
          state.status = 'idle';
          state.error = action.payload;
        },
      );
  },
});

export const { authStateChanged, clearAuthError } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export default authSlice.reducer;
