export interface IUserProfileUpdateRequest extends IUserProfile {
  password?: string;
}

export interface IUserProfile {
  username: string;
  profileImg?: File | null;
  bgImg?: File | null;
}
