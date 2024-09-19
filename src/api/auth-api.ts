import { ILoginForm, IRegisterForm } from "../interface/auth-interface";

const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/auth`;

export async function doLogin(loginForm: ILoginForm) {
  console.log("in api", JSON.stringify(loginForm));
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify(loginForm),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    return null;
  }
}

export async function doLogout() {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    credentials: "include",
  });
  return response;
}

export async function doRegister(registerForm: IRegisterForm) {
  console.log("in api", JSON.stringify(registerForm));
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
    return response;
  } catch (error) {
    console.error("Failed to register:", error);
    throw error;
  }
}

export async function doRefresh() {
  try {
    const response = await fetch(`${BASE_URL}/refresh`, {
      credentials: "include",
      method: "POST",
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Failed to Refresh:", error);
    return null;
  }
}
