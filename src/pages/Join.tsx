import styled from "styled-components";
import { AuthWrapper } from "./Login";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

const JoinForm = styled.form`
  display: flex;
  width: 100%;
`;
const JoinSubmitBtn = styled.button``;

export default function JoinPage() {
  const navigate = useNavigate();
  const { handleSubmit, register, setValue, setError } = useForm();
  const onValid = () => {
    navigate("/todos");
  };
  const createAccountMutation = useMutation({});
  return (
    <AuthWrapper>
      <JoinForm onSubmit={handleSubmit(onValid)}>
        <input
          type="text"
          {...register("username", { required: true })}
          placeholder=""
        />
        <input
          type="text"
          {...register("username", { required: true })}
          placeholder=""
        />
        <JoinSubmitBtn>Join</JoinSubmitBtn>
      </JoinForm>
    </AuthWrapper>
  );
}
