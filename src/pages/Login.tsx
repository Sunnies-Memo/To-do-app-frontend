import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../util";
import { useEffect, useState } from "react";
import { ILoginForm } from "../interface/auth-interface";

export const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  min-width: 500px;
  width: 30%;
  border: 1px solid black;
`;
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: 1px solid black;
`;

const LoginSumbitBtn = styled.button``;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLogin } = useAuth();
  const {
    handleSubmit,
    register,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ILoginForm>();
  const [formError, setFormError] = useState<String | null>(null);

  useEffect(() => {
    if (isLogin() !== null) {
      console.log("already login");
      navigate("/todos");
    }
  }, [isLogin, navigate]);
  const onSubmit = async (data: ILoginForm) => {
    try {
      await login(data);
      navigate("/todos");
    } catch (error) {
      setFormError("Please check your username or password.");
    }
  };
  return (
    <AuthWrapper>
      <LoginForm onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("username", { required: true })}
          placeholder="Username"
        />
        <input type="password" {...register("password", { required: true })} />
        <div>{formError}</div>
        <LoginSumbitBtn>Login</LoginSumbitBtn>
        <Link to={"/join"}>
          <span>sign in</span>
        </Link>
      </LoginForm>
    </AuthWrapper>
  );
}
