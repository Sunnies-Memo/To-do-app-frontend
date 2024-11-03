import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily,
} from "recoil";
import {
  IBoard,
  IBoardUpdate,
  ITodo,
  IToDoState,
} from "./interface/todo-interface";
import { IUserState } from "./interface/auth-interface";

export interface IBoardOrder {
  boardId: string;
  orderIndex: number;
}

export const orderedBoardList = atom<IBoardOrder[]>({
  key: "orderedBoardList",
  default: [],
});

export const boardAtomFamily = atomFamily<IBoard, string>({
  key: "boardAtomFamily",
  default: (boardId: string) => ({
    boardId,
    title: "",
    orderIndex: 0,
    username: "",
    toDoList: [],
  }),
});

export const boardOrderSelector = selectorFamily<number, string>({
  key: "boardOrder",
  get:
    (boardId: string) =>
    ({ get }) => {
      const boardOrder = get(boardAtomFamily(boardId)).orderIndex;
      return boardOrder;
    },
});

export const cardListSelector = selectorFamily<ITodo[] | undefined, string>({
  key: "cardList",
  get:
    (boardId: string) =>
    ({ get }) => {
      const board = get(boardAtomFamily(boardId));
      return board.toDoList;
    },
  set:
    (boardId: string) =>
    ({ set, reset }, tempToDoList: ITodo[] | DefaultValue | undefined) => {
      if (tempToDoList instanceof DefaultValue) {
        reset(boardAtomFamily(boardId));
      } else if (tempToDoList !== undefined) {
        set(boardAtomFamily(boardId), (prevBoard) => ({
          ...prevBoard,
          toDoList: [...tempToDoList],
        }));
      }
    },
});

export const lastToDoIndexSelector = selectorFamily<number, string>({
  key: "lastToDoIndex",
  get:
    (boardId: string) =>
    ({ get }) => {
      const cardList = get(cardListSelector(boardId));
      if (cardList !== undefined) {
        let lastIndex = cardList[cardList.length - 1].orderIndex;
        lastIndex = lastIndex ? lastIndex : 0;
        return lastIndex;
      } else {
        return 0;
      }
    },
});

export const toDoState = atom<IToDoState>({
  key: "toDo",
  default: {},
});

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
