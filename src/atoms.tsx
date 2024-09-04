import { atom, selector } from "recoil";
import { IToDoState } from "./interface/todo-interface";

export const toDoState = atom<IToDoState>({
  key: "toDo",
  default: {
    "to do": [],
    doing: [],
    done: [],
  },
});

// export const boardState = atom({
//   key: "boards",
//   default: ["to do", "doing", "done"],
// });
export const boardState = atom<string[]>({
  key: "boards",
  default: [],
});

export const cardDrop = atom({
  key: "cardDrop",
  default: false,
});

export const isAuthenticated = atom({
  key: "isAuthenticated",
  default: false,
});

export const userProfileSelector = selector({
  key: "userProfileSelector",
  get: () => {},
});
