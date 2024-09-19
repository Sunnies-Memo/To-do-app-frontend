import styled from "styled-components";
import { AuthWrapper, ILoginForm } from "./Login";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { doRegister } from "../api/auth-api";

const JoinForm = styled.form`
  display: flex;
  width: 100%;
`;
const JoinSubmitBtn = styled.button``;

export interface IJoinForm extends ILoginForm {
  profileImg?: string;
}

export default function JoinPage() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    setError,
  } = useForm<IJoinForm>();
  const onValid = async (data: IJoinForm) => {
    try {
      await doRegister(data);
      navigate("/login");
    } catch (error) {
      console.log("가입실패");
    }
  };

  return (
    <AuthWrapper>
      <JoinForm onSubmit={handleSubmit(onValid)}>
        <input
          type="text"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 4,
              message: "Username must be at least 4 characters",
            },
            maxLength: {
              value: 12,
              message: "Username cannot exceed 12 characters",
            },
            pattern: {
              value: /^[A-Za-z0-9]+$/,
              message: "Special characters cannot included in username",
            },
          })}
        />
        {errors.username && <p>{errors.username.message}</p>}
        <input
          type="passowrd"
          {...register("username", {
            required: "Password is required",
            minLength: {
              value: 7,
              message: "Password must be at least 7 characters",
            },
            maxLength: {
              value: 13,
              message: "Password cannot exceed 3 characters",
            },
            pattern: {
              value:
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/,
              message:
                "Password must include letters, numbers, and special characters",
            },
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}
        <input type="hidden" {...register("profileImg", { required: false })} />
        <JoinSubmitBtn>Join</JoinSubmitBtn>
      </JoinForm>
    </AuthWrapper>
  );
}
