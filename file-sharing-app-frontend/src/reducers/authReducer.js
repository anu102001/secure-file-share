import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';


const initialState = {
  accessToken: null,
  refreshToken: null,
  isAdmin: false,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      const { accessToken, refreshToken, isAdmin, userId } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAdmin = isAdmin;
      state.userId = userId;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAdmin = false;
      state.userId = null;
    },
  },
});

export const selectAuthState = createSelector(
  (state) => state.auth,
  (auth) => ({
    accessToken: auth.accessToken,
    userId: auth.userId,
    isAdmin: auth.isAdmin,
  })
);

export const { setAuthData, logout } = authSlice.actions;

export default authSlice.reducer;
