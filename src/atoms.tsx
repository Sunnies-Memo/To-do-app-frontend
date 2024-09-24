import { atom, atomFamily, selector } from "recoil";
import { IBoardUpdate, ITodo, IToDoState } from "./interface/todo-interface";
import { IUserState } from "./interface/auth-interface";

export const toDoState = atom<IToDoState>({
  key: "toDo",
  default: {},
});

export const boardState = atom<IBoardUpdate[]>({
  key: "boards",
  default: [],
});

export const toDosFamily = atomFamily<ITodo[], string>({
  key: "toDosFamily",
  default: [],
});

export const cardDrop = atom({
  key: "cardDrop",
  default: false,
});

export const lastBoardIndex = atom<number>({
  key: "lastBIndex",
  default: 100,
});

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

export const userProfileSelector = selector({
  key: "userProfileSelector",
  get: async () => {},
});
