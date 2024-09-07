import { useForm } from "react-hook-form";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { boardState, lastBoardIndex, toDoState, userState } from "../atoms";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IBoardForm, IBoardUpdate } from "../interface/todo-interface";
import { useAuth } from "../util";
import { createBoard } from "../api/todo-api";

const Wrapper = styled(motion.div)`
  position: fixed;
  display: flex;
  justify-content: center;
  top: 15px;
  width: 260px;
  height: 30px;
  overflow: visible;
`;
const wrapperVarients = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};
const Bar = styled.div`
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background-color: dimgray;
`;
const Form = styled(motion.form)`
  position: absolute;
  bottom: -70px;
  width: 250px;
  background-color: ${(props) => props.theme.boardColor};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 5px;
  padding: 8px;
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 5px;
  }
  input {
    width: 80%;
    height: 25px;
    border: none;
    border-radius: 3px;
    padding: 0 5px 0 5px;
    box-shadow: rgba(99, 99, 99, 0.3) inset 1px 1px 2px 0px;
    text-align: center;
  }
  button {
    height: 23px;
    padding: 3px;
    background-color: #a6a6a6;
    border: none;
    border-radius: 3px;
    margin-left: 5px;
  }
  button:hover {
    cursor: pointer;
  }
`;
const formVarients = {
  start: {
    opacity: 0,
    y: 10,
  },
  end: {
    opacity: 1,
    y: 0,
  },
};
const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
`;

function BoardForm() {
  const isLogin = useAuth();
  const userData = useRecoilValue(userState);

  const lastBIndex = useRecoilValue(lastBoardIndex);
  const [showForm, setShowForm] = useState(false);
  const setBoards = useSetRecoilState(boardState);
  const setToDoState = useSetRecoilState(toDoState);
  const { handleSubmit, register, setValue } = useForm<IBoardForm>();

  const onValid = async ({ title }: IBoardForm) => {
    const token = isLogin();
    if (!token) return;
    const newBoard = {
      title: title,
      orderIndex: lastBIndex + 10,
      memberId: userData.memberId,
    };
    try {
      await createBoard(newBoard, token);
      setToDoState((prev) => {
        return { ...prev, [title]: [] };
      });
      setBoards((prev) => {
        const newBoards: IBoardUpdate[] = [...prev, newBoard];
        localStorage.setItem("BOARDS", JSON.stringify(newBoards));
        return newBoards;
      });
      setValue("title", "");
    } catch {
      return;
    }
  };

  return (
    <Wrapper
      variants={wrapperVarients}
      whileHover={"hover"}
      onMouseLeave={() => setShowForm(false)}
      onMouseOver={() => setShowForm(true)}
    >
      <Bar />
      <AnimatePresence>
        {showForm ? (
          <Form
            onSubmit={handleSubmit(onValid)}
            onMouseLeave={() => setShowForm(false)}
            variants={formVarients}
            initial={"start"}
            animate={"end"}
            exit={"start"}
          >
            <Title>
              <span>Create New Board</span>
            </Title>
            <div>
              <input
                type="text"
                {...register("title", { required: true })}
                placeholder="Board Name..."
              />
              <button>Create</button>
            </div>
          </Form>
        ) : null}
      </AnimatePresence>
    </Wrapper>
  );
}

export default BoardForm;
