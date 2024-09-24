import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { doRegister } from "../api/auth-api";
import { IRegisterForm } from "../interface/auth-interface";
import { motion } from "framer-motion";
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  border: 1px solid black;
`;
const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12% 0 5% 0;
  & > span {
    font-size: 25px;
  }
`;

const JoinPageBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 60%;
  min-width: 300px;
  height: 50%;
  min-height: 400px;
  margin-bottom: 10%;
  border-radius: 5px;
  background-color: ${(props) => props.theme.boardColor};
`;
const JoinForm = styled.form`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  input {
    height: 25px;
    border-radius: 10px;
    border: none;
    text-align: center;
    &:focus {
      outline: none;
    }
  }
  & > a {
    font-size: 14px;
  }
  & > div {
    position: relative;
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0 10px 0;
    label {
      display: inline-block;
      text-align: center;
      width: 140px;
      margin: 0 20px 0 0;
      font-size: 15px;
    }
    & > p {
      display: inline-block;
      height: 14px;
      bottom: -18px;
      width: auto;
      position: absolute;
      color: tomato;
      font-size: 12px;
    }
  }
`;
const JoinSubmitBtn = styled.button`
  height: 34px;
  width: 20%;
  min-width: 220px;
  margin: 30px 0 30px 0;
  font-size: 17px;
  border-radius: 20px;
  border: none;
  background-color: ${(props) => props.theme.bigBtn.default};
  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.bigBtn.hover};
  }
`;

export default function JoinPage() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<IRegisterForm>();
  const password = watch("password");
  const onValid = async (data: IRegisterForm) => {
    try {
      if (data.password !== data.password2) {
        throw new Error("check your password again");
      }
      await doRegister(data);
      navigate("/login");
    } catch (error) {
      alert("Fail to sign in");
    }
  };

  return (
    <Wrapper>
      <JoinPageBox>
        <Title>
          <span>Sign In</span>
        </Title>
        <JoinForm onSubmit={handleSubmit(onValid)}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
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
              placeholder="Username"
            />
            {errors.username && <p>{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register("password", {
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
              placeholder="Password"
            />
            {errors.password && <p>{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="password2">Confirm Password</label>
            <input
              id="password2"
              type="password"
              {...register("password2", {
                required: "Password2 is required",
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
                validate: (value) =>
                  value === password || "password does not match",
              })}
              placeholder="Confirm your password"
            />
            {errors.password2 && <p>{errors.password2.message}</p>}
          </div>
          <input
            type="hidden"
            {...register("profileImg", {
              required: false,
              pattern: {
                value: /^(https?:\/\/.*\.(?:png|jpg|jpeg))$/i,
                message: "Please enter a valid image URL (jpg, jpeg, png)",
              },
            })}
          />
          <JoinSubmitBtn>Sign In</JoinSubmitBtn>
          <Link to={"/login"}>
            <span>Go back</span>
          </Link>
        </JoinForm>
      </JoinPageBox>
    </Wrapper>
  );
}
