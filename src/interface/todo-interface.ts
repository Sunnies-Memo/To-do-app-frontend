export interface IBoard extends IBoardUpdate {
  toDoList?: ITodo[];
}

export interface IBoardOrder {
  boardId: string;
  orderIndex: number;
  title: string;
}

export interface IBoardUpdate extends IBoardOrder {
  username: string;
}

export interface IBoardCreate {
  title: string;
  orderIndex: number;
  username: string;
}

export interface IToDoState {
  [key: string]: ITodo[];
}
export interface ITodo {
  todoId?: string;
  text: string;
  orderIndex?: number;
  board?: { boardId: string };
}

export interface IBoardForm {
  title: string;
}
