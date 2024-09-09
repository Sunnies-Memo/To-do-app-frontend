export interface ITodo {
  todoId?: number;
  text: string;
  orderIndex?: number;
  board?: IBoard;
}

export interface IToDoState {
  [key: string]: ITodo[];
}

export interface IBoard extends IBoardUpdate {
  toDoList?: ITodo[];
}

export interface IBoardUpdate {
  title: string;
  boardId?: number;
  orderIndex: number;
  memberId: number;
}

export interface IBoardForm {
  title: string;
}
