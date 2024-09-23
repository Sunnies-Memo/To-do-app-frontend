export interface ILoginForm {
  username: string;
  password: string;
}

export interface IRegisterForm extends ILoginForm {
  profileImg?: string;
  password2?: string;
}

export interface ILoginResponse {
  member: IUserState;
  accessToken: string;
}

export interface IUserState {
  username: string;
  bgImg?: string;
  profileImg?: string;
}

export interface IPasswordChange {
  username: string;
  oldPassword: string;
  newPassword: string;
}
