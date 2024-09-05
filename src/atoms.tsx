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

export const isAuthenticated = atom({
  key: "isAuthenticated",
  default: true,
});

export const userProfileSelector = selector({
  key: "userProfileSelector",
  get: () => {},
});
