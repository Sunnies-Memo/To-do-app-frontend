import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../util";
import { useEffect, useState } from "react";
import { ILoginForm } from "../interface/auth-interface";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  border: 1px solid black;
`;
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 15%;
`;
const Input = styled.input`
  margin: 5px 0 5px 0;
  height: 30px;
  width: 20%;
  min-width: 250px;
  text-align: center;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  &:focus {
    outline: none;
  }
`;

const LoginSumbitBtn = styled.button`
  height: 34px;
  width: 20%;
  min-width: 220px;
  margin: 10px 0 30px 0;
  font-size: 17px;
  border-radius: 20px;
  border: none;
  background-color: ${(props) => props.theme.bigBtn.default};
  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.bigBtn.hover};
  }
`;
const Span = styled.div`
  font-size: 14px;
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLogin } = useAuth();
  const { handleSubmit, register } = useForm<ILoginForm>();
  const [formError, setFormError] = useState<String | null>(null);

  useEffect(() => {
    if (isLogin() !== null) {
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
    <Wrapper>
      <LoginForm onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          {...register("username", { required: true })}
          placeholder="Username"
        />
        <Input
          type="password"
          {...register("password", { required: true })}
          placeholder="Password"
        />
        <div>{formError}</div>
        <LoginSumbitBtn>Login</LoginSumbitBtn>
        <Link to={"/join"}>
          <Span>sign in</Span>
        </Link>
      </LoginForm>
    </Wrapper>
  );
}
