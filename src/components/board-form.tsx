import { useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { lastBoardIndexSelector, userNameSelector } from "../atoms";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IBoard, IBoardCreate, IBoardForm } from "../interface/todo-interface";

import { createBoard } from "../api/todo-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 2rem;
  width: 200px;
  height: 40px;
  overflow: visible;
  z-index: 10;
`;

const BarWrapper = styled(motion.div)`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.theme.gradients.primary};
  border: ${(props) => props.theme.borders.pixel};
  border-radius: 20px;
  box-shadow: 4px 4px 0 rgba(45, 0, 102, 0.2);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Bar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${(props) => props.theme.textPrimary};
`;

const Form = styled(motion.form)`
  position: absolute;
  bottom: 60px;
  width: 280px;
  background: ${(props) => props.theme.gradients.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 12px;
  padding: 1.5rem;
  border: ${(props) => props.theme.borders.pixel};
  box-shadow: 6px 6px 0 rgba(45, 0, 102, 0.2);

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    width: 100%;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    height: 36px;
    border: ${(props) => props.theme.borders.soft};
    border-radius: 8px;
    padding: 0 0.5rem;
    font-size: 0.9rem;
    background: white;

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primaryAccent};
      box-shadow: 0 0 0 3px rgba(200, 162, 200, 0.2);
    }
  }

  button {
    padding: 0 0.75rem;
    height: 36px;
    background: ${(props) => props.theme.secondaryAccent};
    color: ${(props) => props.theme.textPrimary};
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.9rem;
    white-space: nowrap;

    &:hover {
      background: ${(props) => props.theme.bigBtn.hover};
      transform: translateY(-2px);
    }
  }
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;

  span {
    font-size: 1.25rem;
    font-weight: bold;
    color: ${(props) => props.theme.textPrimary};

    &::before,
    &::after {
      content: "✦";
      margin: 0 0.5rem;
      color: ${(props) => props.theme.secondaryAccent};
      font-size: 0.8rem;
    }
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
  const queryClient = useQueryClient();
  const userName = useRecoilValue(userNameSelector);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const lastBIndex = useRecoilValue(lastBoardIndexSelector);
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
      alert("Error");
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
      username: userName,
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
