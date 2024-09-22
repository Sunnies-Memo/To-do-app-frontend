export interface IUserProfileUpdateRequest {
  username: string;
  password?: string;
  profileImg?: File | null;
  bgImg?: File | null;
}
