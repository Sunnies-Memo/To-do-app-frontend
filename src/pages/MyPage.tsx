import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { IUserProfile } from "../interface/profie-interface";
import { useAuth } from "../util";
import {
  changePassword,
  getProfile,
  uploadProfileImg,
} from "../api/profile-api";
import {
  IPasswordChange,
  IPasswordChangeForm,
} from "../interface/auth-interface";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import profileImg from "../images/default_profile.jpg";
import { ImageDropZone } from "../components/image-dropzone";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: 2rem;
  background: ${(props) => props.theme.background};
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.5) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: "✦";
    position: fixed;
    font-size: 24px;
    color: ${(props) => props.theme.primaryAccent};
    animation: float 3s ease-in-out infinite;
  }

  &::before {
    top: 20px;
    left: 40px;
  }

  &::after {
    bottom: 40px;
    right: 20px;
    animation-delay: 1.5s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const MyPageBox = styled(motion.div)`
  background: ${(props) => props.theme.gradients.primary};
  border: ${(props) => props.theme.borders.pixel};
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: 8px 8px 0 rgba(45, 0, 102, 0.2);
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;

  span {
    font-size: 2rem;
    color: ${(props) => props.theme.textPrimary};
    font-weight: bold;
    text-shadow: 2px 2px 0 ${(props) => props.theme.secondaryAccent};
  }

  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: ${(props) => props.theme.borders.pixel};
    object-fit: cover;
    box-shadow: 3px 3px 0 ${(props) => props.theme.primaryAccent};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: ${(props) => props.theme.borderRadius};
  border: ${(props) => props.theme.borders.soft};

  div {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;

    label {
      min-width: 120px;
      font-weight: bold;
      color: ${(props) => props.theme.textPrimary};
    }

    input {
      flex: 1;
      padding: 0.8rem;
      border: ${(props) => props.theme.borders.soft};
      border-radius: 8px;
      font-size: 1rem;
      background: ${(props) => props.theme.background};
      color: ${(props) => props.theme.textPrimary};

      &:disabled {
        background: ${(props) => `${props.theme.primaryAccent}40`};
      }
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      background: ${(props) => props.theme.btnColor.btnDefault};
      color: ${(props) => props.theme.textPrimary};
      font-weight: bold;
      transition: all 0.2s ease;

      &:hover {
        background: ${(props) => props.theme.btnColor.btnHover};
        transform: translateY(-2px);
      }
    }
  }
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: ${(props) => props.theme.borderRadius};
  border: ${(props) => props.theme.borders.soft};

  div {
    position: relative;

    p {
      position: absolute;
      bottom: -20px;
      left: 0;
      color: #ff6b6b;
      font-size: 0.8rem;
    }
  }
`;

const ChangePwdBtn = styled.button`
  align-self: center;
  padding: 0.8rem 1.5rem;
  border: ${(props) => props.theme.borders.pixel};
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.theme.btnColor.btnDefault};
  color: ${(props) => props.theme.textPrimary};
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.btnColor.btnHover};
    transform: translateY(-2px);
    box-shadow: 3px 3px 0 ${(props) => props.theme.primaryAccent};
  }
`;

interface IArea {
  size: number;
}

const ImgDropArea = styled.div<IArea>`
  width: 100%;
  padding: 1rem;
  background: white;
  border-radius: ${(props) => props.theme.borderRadius};
  border: ${(props) => props.theme.borders.soft};

  & > div {
    height: 24vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    span {
      font-weight: bold;
      color: ${(props) => props.theme.textPrimary};
    }
  }
`;

export default function MyPage() {
  const queryClient = useQueryClient();
  const { isLogin } = useAuth();
  const token = isLogin();
  const imgDropAreaRef = useRef<HTMLDivElement>(null);
  const [isPwdCng, setIsPwdCng] = useState(false);
  const [boxSize, setBoxSize] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IPasswordChangeForm>();
  const newPassword = watch("newPassword");
  const { data: profileData } = useQuery<IUserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => getProfile(token),
    staleTime: 1000 * 60 * 15,
    refetchOnMount: false,
  });
  const changePwdMutation = useMutation({
    mutationFn: (data: IPasswordChange) => changePassword(data, token),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
  const handlePwdCngBtn = () => {
    setIsPwdCng((prev) => !prev);
  };
  const onValid = async (data: IPasswordChangeForm) => {
    try {
      if (data.newPassword !== data.newPassword2) {
        throw new Error("check your password again");
      }
      changePwdMutation.mutate(data);
      setIsPwdCng(false);
    } catch (error) {
      alert("Fail to change password");
    }
  };
  useEffect(() => {
    const handleResize = () => {
      if (imgDropAreaRef.current) {
        const width = imgDropAreaRef.current.offsetWidth;
        setBoxSize(width * 0.4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imgDropAreaRef.current?.offsetWidth]);
  return (
    <Wrapper>
      {profileData?.username && (
        <MyPageBox>
          <UserInfo>
            <Title>
              <span>My Page</span>
              <img
                src={
                  profileData?.profileImg
                    ? profileData.profileImg.length > 1
                      ? profileData.profileImg
                      : profileImg
                    : profileImg
                }
                alt="Profile"
              />
            </Title>
            <div>
              <label htmlFor="mypage-username">Username</label>
              <input
                id="mypage-username"
                type="text"
                value={profileData?.username}
              />
            </div>
            <div>
              <label htmlFor="mypage-password">Password</label>
              <input type="password" disabled value={"00000000"} />
              {isPwdCng ? (
                <button onClick={handlePwdCngBtn}>Cancel</button>
              ) : (
                <button onClick={handlePwdCngBtn}>Modify</button>
              )}
            </div>
            <AnimatePresence>
              {isPwdCng && (
                <Form onSubmit={handleSubmit(onValid)}>
                  <input
                    type="hidden"
                    {...register("username", { value: profileData.username })}
                  />
                  <div>
                    <label htmlFor="mypage-old-password">Old password</label>
                    <input
                      id="mypage-old-password"
                      type="password"
                      {...register("oldPassword", {
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
                    {errors.oldPassword && <p>{errors.oldPassword.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="mypage-new-password">new password</label>
                    <input
                      id="mypage-new-password"
                      type="password"
                      {...register("newPassword", {
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
                    {errors.newPassword && <p>{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="mypage-new-password2">
                      Confirm <br />
                      new password
                    </label>
                    <input
                      id="mypage-new-password2"
                      type="password"
                      {...register("newPassword2", {
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
                        validate: (value) =>
                          value === newPassword || "password does not match",
                      })}
                      placeholder="Password"
                    />
                    {errors.newPassword2 && (
                      <p>{errors.newPassword2.message}</p>
                    )}
                  </div>
                  <ChangePwdBtn>Change</ChangePwdBtn>
                </Form>
              )}
            </AnimatePresence>
          </UserInfo>
          <ImgDropArea ref={imgDropAreaRef} size={boxSize}>
            <div>
              <span>Profile Image</span>
              <ImageDropZone
                username={profileData.username}
                token={token ? token : ""}
                uploadFn={uploadProfileImg}
              />
            </div>
          </ImgDropArea>
        </MyPageBox>
      )}
    </Wrapper>
  );
}
