export interface ChangePasswordRequest {
  // Current password ng user.
  // Ito ang existing password na ibe-verify ng API.
  currentPassword: string;

  // Bagong password na gustong gamitin ng user.
  newPassword: string;

  // Confirmation ng bagong password.
  // Dapat pareho sa newPassword.
  confirmPassword: string;
}
