import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  IUserProfile,
  IUserProfileUpdateRequest,
} from "../interface/profie-interface";
import { useAuth } from "../util";
import {
  changePassword,
  getProfile,
  uploadBgImg,
  uploadProfileImg,
} from "../api/profile-api";
import { IPasswordChange } from "../interface/auth-interface";
import { motion } from "framer-motion";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  border: 1px solid black;
`;

const MyPageBox = styled(motion.div)`
  display: flex;
  width: 60%;
  min-width: 300px;
  height: 50%;
  min-height: 400px;
  margin-bottom: 15%;
  border-radius: 5px;
  background-color: ${(props) => props.theme.boardColor};
`;

export default function MyPage() {
  const queryClient = useQueryClient();
  const { isLogin } = useAuth();
  const token = isLogin();
  const { data: profileData } = useQuery<IUserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => getProfile(token),
  });
  const uploadProfileImgMutation = useMutation({
    mutationFn: (data: IUserProfileUpdateRequest) =>
      uploadProfileImg(data, token),
    onError: () => {},
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
  const uploadBgImgMutation = useMutation({
    mutationFn: (data: IUserProfileUpdateRequest) => uploadBgImg(data, token),
    onError: () => {},
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
  const changePwdMutation = useMutation({
    mutationFn: (data: IPasswordChange) => changePassword(data, token),
    onError: () => {},
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  return (
    <Wrapper>
      <MyPageBox></MyPageBox>
    </Wrapper>
  );
}
