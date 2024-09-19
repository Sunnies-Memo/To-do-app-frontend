import { useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { lastBoardIndex, userState } from "../atoms";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IBoard, IBoardCreate, IBoardForm } from "../interface/todo-interface";

import { createBoard } from "../api/todo-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

function BoardForm({ token }: { token: string | null }) {
  console.log("rendering BoardForm");
  const queryClient = useQueryClient();
  const userData = useRecoilValue(userState);

  const lastBIndex = useRecoilValue(lastBoardIndex);
  const [showForm, setShowForm] = useState(false);
  const { handleSubmit, register, setValue } = useForm<IBoardForm>();

  const createBoardMutation = useMutation({
    mutationFn: (newBoard: IBoardCreate) => createBoard(newBoard, token),
    onMutate: async (newBoard: IBoardCreate) => {
      await queryClient.cancelQueries({ queryKey: ["boards data", token] });
      const prevData = queryClient.getQueryData<IBoard[]>([
        "boards data",
        token,
      ]);
      const tempId = "temporaryIdForBoard";
      queryClient.setQueryData<IBoard[]>(["boards data", token], (prev) => {
        if (!prev) return prevData;
        const newData = [...prev, { ...newBoard, boardId: tempId }];
        return newData;
      });

      return { prevData };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["boards data", token], context?.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["boards data", token] });
    },
  });

  const onValid = async ({ title }: IBoardForm) => {
    if (!token) return;
    const newBoard = {
      title: title,
      orderIndex: lastBIndex + 40,
      memberId: userData.memberId,
    };
    createBoardMutation.mutate(newBoard);
    setValue("title", "");
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
