import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { IUploadImg, IUserProfile } from "../interface/profie-interface";
import { useAuth } from "../util";
import {
  changePassword,
  getProfile,
  uploadBgImg,
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
import { ImageDropZone } from "../components/file-dropzone";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  display: flex;
`;

const MyPageBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  min-width: 440px;
  height: auto;
  min-height: 400px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.boardColor};
`;
const Title = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 10px 0 5px 0;
  & > span {
    display: block;
    padding-bottom: 3px;
    text-align: center;
    font-size: 20px;
    margin-left: 5px;
  }
  & > img {
    display: block;
    height: 60px;
    width: 60px;
    border-radius: 20px;
    border: 1px solid black;
    margin-left: 10%;
  }
`;

const UserInfo = styled.div`
  display: flex;
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
    &:disabled {
      background-color: #f1f6fc;
    }
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
      width: 170px;
      margin: 0 20px 0 0;
      font-size: 15px;
    }
    & > button {
      position: absolute;
      right: -22%;
      height: 24px;
      width: 50px;
      border: none;
      border-radius: 5px;
      background-color: ${(props) => props.theme.btnColor.btnDefault};
      font-size: 12px;
      &:hover {
        background-color: ${(props) => props.theme.btnColor.btnHover};
      }
    }
  }
`;
const Form = styled(motion.form)`
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
    margin: 12px 0 12px 0;
    label {
      display: inline-block;
      text-align: center;
      width: 170px;
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
const ChangePwdBtn = styled.button`
  margin: 15px 0 15px 0;
  width: 80px;
  height: 30px;
  border-radius: 5px;
  border: none;
  background-color: ${(props) => props.theme.btnColor.btnDefault};
  &:hover {
    background-color: ${(props) => props.theme.btnColor.btnHover};
  }
`;
interface IArea {
  size: number;
}
const ImgDropArea = styled.div<IArea>`
  width: 100%;
  height: ${(props) => props.size + 20}px;
  display: flex;
  justify-content: space-around;
  & > div {
    height: ${(props) => props.size + 15}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    border: 1px solid white;
    padding: 4px;
    & > span {
      display: inline-block;
      text-align: center;
      padding: 5px 0 8px 0;
    }
  }
  & > div:first-child {
    width: 40%;
  }
  & > div:last-child {
    width: 50%;
  }
`;
export default function MyPage() {
  console.log("my page");
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
  });
  const changePwdMutation = useMutation({
    mutationFn: (data: IPasswordChange) => changePassword(data, token),
    onError: () => {
      console.log("change password error");
    },
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
        console.log("diffrent password");
        throw new Error("check your password again");
      }
      changePwdMutation.mutate(data);
      setIsPwdCng(false);
    } catch (error) {
      alert("Fail to change password");
      console.log("Fail to change password");
    }
  };
  useEffect(() => {
    if (imgDropAreaRef.current) {
      const width = imgDropAreaRef.current.offsetWidth;
      setBoxSize(width * 0.4);
    }

    const handleResize = () => {
      if (imgDropAreaRef.current) {
        const width = imgDropAreaRef.current.offsetWidth;
        setBoxSize(width * 0.4);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Wrapper>
      {profileData?.username && (
        <MyPageBox>
          <UserInfo>
            <Title>
              <span>My Page</span>
              <img
                src={
                  profileData?.profileImg ? profileData.profileImg : profileImg
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
                hasTempImg
                token={token ? token : ""}
                uploadFn={uploadProfileImg}
                size={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <div>
              <span>Background Image</span>
              <ImageDropZone
                username={profileData.username}
                token={token ? token : ""}
                uploadFn={uploadBgImg}
                size={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </ImgDropArea>
        </MyPageBox>
      )}
    </Wrapper>
  );
}
