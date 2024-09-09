import { IBoard, IBoardUpdate, ITodo } from "../interface/todo-interface";
const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/boards`;

export async function getBoards(token: string | null) {
  console.log("Fetch : getBoards");
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

export async function moveBoard(board: IBoard, gap: number, token: string) {
  console.log("Fetch : moveBoard : " + board.title);
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "PUT",
      body: JSON.stringify({ board: board, gap: gap }),
    });
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

export async function createBoard(board: IBoard, token: string | null) {
  console.log("Fetch : createBoard", JSON.stringify(board));
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
    return response.json();
  } catch (error) {
    console.error("Failed to create board:", error);
    throw error;
  }
}

export async function deleteBoard(board: IBoardUpdate, token: string) {
  console.log("Fetch : deleteBoard");
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
      method: "DELETE",
      body: JSON.stringify(board),
    });
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
  console.log("Fetch : createToDo", JSON.stringify(todo));
  try {
    const response = await fetch(`${BASE_URL}/todo`, {
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
    return response.json();
  } catch (error) {
    console.error("Failed to create todo:", error);
    throw error;
  }
}

export async function moveToDo(todo: ITodo, gap: number, token: string) {
  console.log("Fetch : moveToDo", JSON.stringify({ todo: todo, gap: gap }));
  try {
    const response = await fetch(`${BASE_URL}/todo`, {
      headers: {
        // Authorization: `Bearer ${token}`
        "Content-Type": "application/json",
      },
      //   credentials: "include",
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
  console.log("Fetch : deleteToDo", JSON.stringify(todo));
  try {
    const response = await fetch(`${BASE_URL}/todo`, {
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
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw error;
  }
}
