export interface IBoard extends IBoardUpdate {
  toDoList?: ITodo[];
}

export interface IBoardUpdate {
  title: string;
  boardId: string;
  orderIndex: number;
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
  board?: IBoard;
}

export interface IBoardForm {
  title: string;
}
