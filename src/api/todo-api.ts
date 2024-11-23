import { IBoardCreate, IBoardUpdate, ITodo } from "../interface/todo-interface";
import { doRefresh } from "./auth-api";
const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/boards`;

export async function getBoards(
  token: string | null,
  retry = true
): Promise<any> {
  console.log("getBoards called");
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (response.status === 401 && retry) {
      const newAccessToken: string = await doRefresh();
      return getBoards(newAccessToken, (retry = false));
    }
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

export async function moveBoard(
  board: IBoardUpdate,
  gap: number,
  token: string,
  retry = true
): Promise<any> {
  try {
    console.log("moveBoard", JSON.stringify({ board: board, gap: gap }), token);
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "PUT",
      body: JSON.stringify({ board: board, gap: gap }),
    });
    if (response.status === 401 && retry) {
      const newAccessToken: string = await doRefresh();
      return moveBoard(board, gap, newAccessToken, (retry = false));
    }
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to move board:", error);
    throw error;
  }
}

export async function createBoard(
  board: IBoardCreate,
  token: string | null,
  retry = true
): Promise<any> {
  console.log("creating board..", board);
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(board),
    });
    if (response.status === 401 && retry) {
      const newAccessToken: string = await doRefresh();
      return createBoard(board, newAccessToken, (retry = false));
    }
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to create board:", error);
    throw error;
  }
}

export async function deleteBoard(
  board: IBoardUpdate,
  token: string,
  retry = true
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
      body: JSON.stringify(board),
    });
    if (response.status === 401 && retry) {
      const newAccessToken: string = await doRefresh();
      return deleteBoard(board, newAccessToken, (retry = false));
    }
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Failed to delete board:", error);
    throw error;
  }
}

export async function createToDo(todo: ITodo, token: string | null) {
  try {
    const response = await fetch(`${BASE_URL}/todo`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to create todo:", error);
    throw error;
  }
}

export async function moveToDo(todo: ITodo, gap: number, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/todo`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "PUT",
      body: JSON.stringify({ todo: todo, gap: gap }),
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
    const response = await fetch(`${BASE_URL}/todo`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "DELETE",
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw error;
  }
}
