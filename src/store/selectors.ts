import type { RootState } from "./store";

export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;
