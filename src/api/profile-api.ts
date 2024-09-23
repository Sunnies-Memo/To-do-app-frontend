import { IPasswordChange } from "../interface/auth-interface";
import { IUploadImg } from "../interface/profie-interface";

const BASE_URL = `${process.env.REACT_APP_SERVER_API}/api/member`;

export async function getProfile(token: string | null) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      method: "GET",
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    throw new Error("Fail to get a profile");
  }
}

export async function changePassword(
  passwordChangeRequest: IPasswordChange,
  token: string | null
) {
  try {
    const response = await fetch(`${BASE_URL}/password`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "PUT",
      body: JSON.stringify({ passwordChangeRequest }),
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    throw new Error("Fail to change password");
  }
}

export async function uploadProfileImg(data: IUploadImg, token: string | null) {
  const form = new FormData();
  form.append("username", data.username);
  data.imgData && form.append("profileImg", data.imgData);
  try {
    const response = await fetch(`${BASE_URL}/profileImg`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    throw new Error("Fail to upload profile image");
  }
}

export async function uploadBgImg(data: IUploadImg, token: string | null) {
  const form = new FormData();
  form.append("username", data.username);
  data.imgData && form.append("bgImg", data.imgData);
  try {
    const response = await fetch(`${BASE_URL}/profileImg`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const errorMessage = `Error: ${response.status} - ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to login:", error);
    throw new Error("Fail to upload background image");
  }
}
