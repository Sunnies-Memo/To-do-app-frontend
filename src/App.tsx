import { DragDropContext, DragStart, DropResult, Droppable } from "react-beautiful-dnd";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled  from "styled-components";
import { IToDoState,  boardState, cardDrop, toDoState } from "./atoms";
import Board from "./components/Board";
import TrashCan from "./components/TrashBin";
import { useEffect, useState } from "react";
import BoardForm from "./components/CreateBoard";

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  `
const Boards = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 10px;
  `



function App() {
  const [toDos, setToDos] = useRecoilState<IToDoState>(toDoState);
  const [boards , setBoards] = useRecoilState<string[]>(boardState);
  const setCardDrop = useSetRecoilState(cardDrop);
  const [boardDrop, setBoardDrop] = useState(false);
  const [showTrashCan, setShowTrashCan] = useState(false);

  useEffect(()=>{
    const storedToDo = localStorage.getItem("TODO");
    storedToDo && setToDos(JSON.parse(storedToDo));
    const storedBoards= localStorage.getItem("BOARDS");
    storedBoards && setBoards(JSON.parse(storedBoards));
  },[]);

  const onDragStart = (info:DragStart) => {
    if(info.source.droppableId !== "boards") {
        setShowTrashCan(true);
        setBoardDrop(true);
        setCardDrop(false);
    } else {
        setBoardDrop(false);
        setCardDrop(true);
    }
  }
  const onDragEnd = (info:DropResult) => {
    const {destination, source} = info;

    if(!destination) {
      console.log("destination undefined")
      setShowTrashCan(false); 
      return
    };

    if(destination.droppableId === "boards"){
      //board movement
      setBoards(boards => {
        const boardsCopy = [...boards];
        const taskBoard = boardsCopy[source.index];
        boardsCopy.splice(source.index, 1);
        boardsCopy.splice(destination.index, 0, taskBoard);
        localStorage.setItem("BOARDS", JSON.stringify(boardsCopy));
        return boardsCopy;
      })
      return
    }else if (source.droppableId === "boards") {
      return
    }

    if(destination?.droppableId === source.droppableId){
      console.log("same board")
      //same board movement
      setToDos(prev => {
        const boardCopy = [...prev[source.droppableId]];
        const taskObj = boardCopy[source.index];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [source.droppableId]:boardCopy
        }
        localStorage.setItem("TODO",JSON.stringify(newToDoObj))
        return newToDoObj;
      })
    }

    if(destination.droppableId === "trashBin"){
      console.log("cross board")
      //Deleting ToDo
      setToDos(prev => {
        const boardCopy = [...prev[source.droppableId]];
        boardCopy.splice(source.index, 1);
        const newToDoObj = {
          ...prev,
          [source.droppableId]:boardCopy
        }
        localStorage.setItem("TODO",JSON.stringify(newToDoObj));
        return newToDoObj;
      })
    } else if(destination.droppableId !== source.droppableId){
      //Cross board movement
      setToDos(prev => {
        const sourceBoard = [...prev[source.droppableId]];
        const targetBoard = [...prev[destination.droppableId]];
        const taskObj = sourceBoard[source.index];
        sourceBoard.splice(source.index, 1);
        targetBoard.splice(destination.index, 0 , taskObj);
        const newToDoObj = {
          ...prev,
          [source.droppableId]:sourceBoard,
          [destination.droppableId]:targetBoard,
        }
        localStorage.setItem("TODO",JSON.stringify(newToDoObj));
        return newToDoObj;
      })
    }

    setShowTrashCan(false);
  }
  
  return (
  <>
  <DragDropContext 
    onDragStart={onDragStart}

    onDragEnd={onDragEnd}
  >
    <Wrapper className="wrapper">
      <BoardForm/>
      <Droppable droppableId="boards" direction="horizontal" isDropDisabled={boardDrop}>
        {(magic) => 
          <Boards 
            className="boards"
            ref={magic.innerRef}
            {...magic.droppableProps}
          >
            {boards.map((board, index) => 
                <Board 
                  index={index}
                  boardId={board} 
                  key={board} 
                  toDos={toDos[board]}
                />
            )}
            {magic.placeholder}
          </Boards>
        }
      </Droppable>
      <TrashCan show={showTrashCan}/>
    </Wrapper>
  </DragDropContext>
  </>
  );
}

export default App;
