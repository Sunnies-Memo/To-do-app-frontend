import { useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { lastBoardIndex, userState } from "../atoms";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IBoard, IBoardCreate, IBoardForm } from "../interface/todo-interface";

import { createBoard } from "../api/todo-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 0px;
  width: 220px;
  height: 30px;
  overflow: visible;
  z-index: 10;
`;
const BarWrapper = styled(motion.div)`
  width: 100%;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Bar = styled.div`
  width: 100%;
  height: 7px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.themeGray.lightGray};
`;
const Form = styled(motion.form)`
  position: absolute;
  bottom: 50px;
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
    background-color: ${(props) => props.theme.dropArea.default};
    border: none;
    border-radius: 3px;
    margin-left: 5px;
  }
  button:hover {
    cursor: pointer;
  }
`;

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

const barVarients = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.2 },
  },
};

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

function BoardForm({ token }: { token: string | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userData = useRecoilValue(userState);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      navigate("/login");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["boards data", token] });
    },
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node) &&
      formRef.current &&
      !formRef.current.contains(event.target as Node)
    ) {
      setShowForm(false);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowForm((prev) => !prev);
  };

  const onValid = async ({ title }: IBoardForm) => {
    if (!token) return;
    const newBoard = {
      title: title,
      orderIndex: lastBIndex + 40,
      username: userData.username,
    };
    createBoardMutation.mutate(newBoard);
    setValue("title", "");
    setShowForm(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <BarWrapper
        onClick={handleClick}
        className="clickable"
        variants={barVarients}
        initial="initial"
        whileHover={"animate"}
      >
        <Bar onClick={handleClick} className="clickable" />
      </BarWrapper>
      <AnimatePresence>
        {showForm ? (
          <Form
            onSubmit={handleSubmit(onValid)}
            variants={formVarients}
            initial={"start"}
            animate={"end"}
            exit={"start"}
            ref={formRef}
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
