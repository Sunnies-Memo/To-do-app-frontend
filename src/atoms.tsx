import { atom } from "recoil";

export interface ITodo {
    id:number;
    text:string
}

export interface IToDoState{
    [key:string]: ITodo[];
}

export const toDoState = atom<IToDoState>({
    key:"toDo",
    default:{
        "to do": [],
        "doing": [],
        "done": [],
    },
});

export const boardState = atom({
    key:"boards",
    default:["to do", "doing", "done"]
})

export const cardDrop = atom({
    key:"cardDrop",
    default:false
})