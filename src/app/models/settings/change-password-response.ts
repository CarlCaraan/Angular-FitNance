export interface ChangePasswordResponse {
  // Message na ibinalik ng API.
  // Halimbawa: "Password changed successfully."
  message: string;

  // Tinutukoy kung successful ang password change.
  // true = successful
  // false = may error
  success: boolean;
}
