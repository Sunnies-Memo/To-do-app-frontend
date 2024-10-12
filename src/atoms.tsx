import { atom, selector } from "recoil";
import { IUserState } from "./interface/auth-interface";

//유저 관련
export const userState = atom<IUserState>({
  key: "userState",
  default: {
    username: "",
    profileImg: undefined,
    bgImg: undefined,
  },
});

export const userToken = atom({
  key: "accessToken",
  default: "",
});

export const isAuthenticated = selector({
  key: "isAuthenticated",
  get: ({ get }) => {
    const token = get(userToken);
    if (token !== null && token.length > 0) return true;
    else return false;
  },
});

// export const userProfileSelector = selector({
//   key: "userProfileSelector",
//   get: async () => {},
// });
