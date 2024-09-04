export interface ITodo {
  id?: number;
  text: string;
  index?: number;
  board?: IBoard;
}

export interface IToDoState {
  [key: string]: ITodo[];
}

export interface IBoard {
  boardId?: number;
  title: string;
  toDoList?: ITodo[];
}
