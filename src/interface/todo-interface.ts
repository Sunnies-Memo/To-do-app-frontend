export interface ITodo {
  todoId?: string;
  text: string;
  orderIndex?: number;
  board?: IBoard;
}

export interface IBoard extends IBoardUpdate {
  toDoList?: ITodo[];
}

export interface IBoardUpdate {
  title: string;
  boardId?: string;
  orderIndex: number;
  memberId: number;
}

export interface IBoardForm {
  title: string;
}

export interface IToDoState {
  [key: string]: ITodo[];
}
