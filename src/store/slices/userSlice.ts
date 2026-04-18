import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { StoredAuthUser } from "../../lib/authCookies";
import { fetchAuthUser, type AuthUserResponse } from "../../api/fetchAuthUser";

export type UserSliceStatus = "idle" | "loading" | "succeeded" | "failed";

export type UserState = {
  profile: AuthUserResponse | null;
  status: UserSliceStatus;
  error: string | null;
};

const initialState: UserState = {
  profile: null,
  status: "idle",
  error: null,
};

/** Async load of `/auth/v1/user` (requires a valid access token). */
export const fetchUserProfile = createAsyncThunk<
  AuthUserResponse,
  string,
  { rejectValue: string }
>("user/fetchProfile", async (accessToken, { rejectWithValue }) => {
  try {
    return await fetchAuthUser(accessToken);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load profile";
    return rejectWithValue(message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<AuthUserResponse>) {
      state.profile = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    /** Hydrate from cookie/session user (e.g. immediately after login). */
    setUserFromSessionUser(state, action: PayloadAction<StoredAuthUser>) {
      const u = action.payload;
      state.profile = {
        id: u.id,
        email: u.email,
        user_metadata: u.user_metadata,
      };
      state.status = "succeeded";
      state.error = null;
    },
    updateUserMetadata(
      state,
      action: PayloadAction<NonNullable<AuthUserResponse["user_metadata"]>>,
    ) {
      if (!state.profile) return;
      state.profile = {
        ...state.profile,
        user_metadata: {
          ...state.profile.user_metadata,
          ...action.payload,
        },
      };
    },
    clearUserProfile(state) {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUserProfile.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (s, action) => {
        s.status = "failed";
        s.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load profile";
      });
  },
});

export const {
  setUserProfile,
  setUserFromSessionUser,
  updateUserMetadata,
  clearUserProfile,
} = userSlice.actions;

export default userSlice.reducer;
