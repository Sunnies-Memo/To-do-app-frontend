import { IRegisterForm } from "../interface/usert-interface";
import { ILoginForm } from "../pages/Login";

const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/auth`;

export async function doLogin(loginForm: ILoginForm) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    //받은 토큰을 저장하는 로직

    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
}

export async function doLogout() {
  //   try {
  // const response = await fetch(`${BASE_URL}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   credentials: "include",
  //     });
  //     if (!response.ok) {
  //       const errorMessage = `Error: ${response.status} - ${response.statusText}`;
  //       throw new Error(errorMessage);
  //     }
  //     return await response.json();
  //   } catch (error) {
  //     console.error("Failed to login:", error);
  //     throw error;
  //   }
}

export async function getUserInfo() {
  //   try {
  // const response = await fetch(`${BASE_URL}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   credentials: "include",
  //     });
  //     if (!response.ok) {
  //       const errorMessage = `Error: ${response.status} - ${response.statusText}`;
  //       throw new Error(errorMessage);
  //     }
  //     return await response.json();
  //   } catch (error) {
  //     console.error("Failed to login:", error);
  //     throw error;
  //   }
}

export async function register(registerForm: IRegisterForm) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(registerForm),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
}

export async function refresh(refreshToken: string) {
  try {
    const response = await fetch(`${BASE_URL}/refresh`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(refreshToken),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
}
