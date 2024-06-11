import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled  from "styled-components";
import { toDoState } from "./atoms";
import Board from "./components/Board";
import TrashCan from "./components/TrashBin";
import { useState } from "react";

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
  const [toDos, setToDos] = useRecoilState(toDoState);
  const [showTrashCan, setShowTrashCan] = useState(false);
  const onDragStart = () => {
    setShowTrashCan(true)
  }
  const onDragEnd = (info:DropResult) => {
    console.log(info)
    const {destination, source} = info;
    if(!destination) {
      console.log("destination undefined")
      setShowTrashCan(false); 
      return
    };
    if(destination?.droppableId === source.droppableId){
      console.log("same board")
      //same board movement
      setToDos(prev => {
        const boardCopy = [...prev[source.droppableId]];
        const taskObj = boardCopy[source.index];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        return {
          ...prev,
          [source.droppableId]:boardCopy
        }
      })
    }
    if(destination.droppableId === "trashBin"){
      console.log("cross board")
      //Deleting ToDo
      setToDos(prev => {
        const boardCopy = [...prev[source.droppableId]];
        boardCopy.splice(source.index, 1);
        return {
          ...prev,
          [source.droppableId]:boardCopy
        }
      })
    } else if(destination.droppableId !== source.droppableId){
      //Cross board movement
      setToDos(prev => {
        const sourceBoard = [...prev[source.droppableId]];
        const targetBoard = [...prev[destination.droppableId]];
        const taskObj = sourceBoard[source.index];
        sourceBoard.splice(source.index, 1);
        targetBoard.splice(destination.index, 0 , taskObj);
        return {
          ...prev,
          [source.droppableId]:sourceBoard,
          [destination.droppableId]:targetBoard,
        }
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
      <Boards className="boards">
        {Object.keys(toDos).map(boardId => <Board boardId={boardId} key={boardId} toDos={toDos[boardId]}/>)}
      </Boards>
      <TrashCan show={showTrashCan}/>
    </Wrapper>
  </DragDropContext>
  </>
  );
}

export default App;
