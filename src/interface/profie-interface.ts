export interface IUserProfileUpdateRequest extends IUserProfile {
  password?: string;
}

export interface IUserProfile {
  username: string;
  profileImg?: string;
  bgImg?: string;
}

export interface IUploadImg {
  username: string;
  imgData: File | null;
}

export interface DropZoneProps {
  hasTempImg?: boolean;
  username: string;
  token: string;
  uploadFn: (data: IUploadImg, token: string) => Promise<any>;
  size: {
    width: string;
    height: string;
  };
}
