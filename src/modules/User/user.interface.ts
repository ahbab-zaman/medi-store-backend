export type TUpdateProfile = {
  name?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
};

export type TChangePassword = {
  currentPassword: string;
  newPassword: string;
};
