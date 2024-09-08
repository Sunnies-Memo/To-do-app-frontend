import { atom, selector } from "recoil";
import { IBoardUpdate, IToDoState } from "./interface/todo-interface";

// export const toDoState = atom<IToDoState>({
//   key: "toDo",
//   default: {
//     "to do": [],
//     doing: [],
//     done: [],
//   },
// });
export const toDoState = atom<IToDoState>({
  key: "toDo",
  default: {},
});

// export const boardState = atom({
//   key: "boards",
//   default: ["to do", "doing", "done"],
// });
export const boardState = atom<IBoardUpdate[]>({
  key: "boards",
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

//유저 관련s
export const userState = atom({
  key: "userState",
  default: {
    memberId: 1, //null로 바꿔놔야
    username: "",
  },
});

export const userToken = atom({
  key: "token",
  default: "token",
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
