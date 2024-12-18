import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily,
} from "recoil";
import { IBoard, IBoardOrder, ITodo } from "./interface/todo-interface";
import { IUserState } from "./interface/auth-interface";
import { IUserProfile } from "./interface/profie-interface";
import { getProfile } from "./api/profile-api";

//칸반 보드 관련
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
        let lastIndex = cardList[cardList.length - 1]?.orderIndex;
        lastIndex = lastIndex ? lastIndex : 0;
        return lastIndex;
      } else {
        return 0;
      }
    },
});

export const lastBoardIndexSelector = selector<number>({
  key: "lastBIndex",
  get: ({ get }) => {
    const boardList = get(orderedBoardList);
    if (boardList !== undefined) {
      let lastIndex = boardList[boardList.length - 1]?.orderIndex;
      lastIndex = lastIndex ? lastIndex : 100;
      return lastIndex;
    } else {
      return 100;
    }
  },
});

export const cardDrop = atom({
  key: "cardDrop",
  default: false,
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

export const userDataSelector = selector({
  key: "userDataSelector",
  get: async ({ get }) => {
    const userProfile: IUserProfile = get(userState);
    return userProfile;
  },
  set: async ({ set, get }) => {
    const token = get(userToken);
    if (token.length > 0) {
      const userProfile: IUserProfile = await getProfile(token);
      set(userState, {
        username: userProfile.username,
        bgImg: userProfile?.bgImg,
        profileImg: userProfile?.profileImg,
      });
    } else {
      return;
    }
  },
});

export const userNameSelector = selector({
  key: "userName",
  get: ({ get }) => {
    const userName = get(userState).username;
    return userName;
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
