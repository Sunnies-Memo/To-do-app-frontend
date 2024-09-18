import { atom, atomFamily, selector } from "recoil";
import { IBoardUpdate, ITodo, IToDoState } from "./interface/todo-interface";

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
export const userState = atom({
  key: "userState",
  default: {
    memberId: null, //null로 바꿔놔야
    username: "",
  },
});

export const userToken = atom({
  key: "accessToken",
  default: "",
});

export const isAuthenticated = selector({
  key: "isAuthenticated",
  get: ({ get }) => {
    const data = get(userState);
    if (data.memberId !== null) return true;
    else return false;
  },
});

export const userProfileSelector = selector({
  key: "userProfileSelector",
  get: async () => {},
});
