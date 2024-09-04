import { IBoard, ITodo } from "../interface/todo-interface";

const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/boards`;

export async function getBoards(token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      //   credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    throw error;
  }
}

export async function createBoard(board: IBoard, token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "POST",
      body: JSON.stringify(board),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to create board:", error);
    throw error;
  }
}

export async function deleteBoard(boardId: number, token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "DELETE",
      body: JSON.stringify({ boardId: boardId }),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to delete board:", error);
    throw error;
  }
}

export async function createToDo(todo: ITodo, token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "POST",
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to create todo:", error);
    throw error;
  }
}

export async function moveToDo(todo: ITodo, token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      //   credentials: "include",
      method: "PUT",
      body: "",
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to update todo:", error);
    throw error;
  }
}

export async function deleteToDo(todo: ITodo, token: string) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "DELETE",
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw error;
  }
}
