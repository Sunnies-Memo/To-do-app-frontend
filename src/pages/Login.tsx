import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

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
  justify-content: center;
  align-items: center;
  width: 100%;
  border: 1px solid black;
`;

const LoginSumbitBtn = styled.button``;

export interface ILoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleSubmit, register, setValue, setError } = useForm();
  const onValid = () => {
    navigate("/todos");
  };
  return (
    <AuthWrapper>
      <LoginForm onSubmit={handleSubmit(onValid)}>
        <input
          type="text"
          {...register("username", { required: true })}
          placeholder="Username"
        />
        <input
          type="text"
          {...register("password", { required: true })}
          placeholder="Username"
        />
        <LoginSumbitBtn>Login</LoginSumbitBtn>
        <Link to={"/join"}>
          <span>sign in</span>
        </Link>
      </LoginForm>
    </AuthWrapper>
  );
}
