import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled  from "styled-components";
import { toDoState } from "./atoms";
import Board from "./components/Board";
import TrashCan from "./components/TrashBin";

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
  const onDragEnd = (info:DropResult) => {
    console.log(info);
    console.log(info.destination);
    const {destination, source} = info;
    if(!destination) return;
    if(destination?.droppableId === source.droppableId){
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

  }
    return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper className="wrapper">
        <Boards className="boards">
         {Object.keys(toDos).map(boardId => <Board boardId={boardId} key={boardId} toDos={toDos[boardId]}/>)}
        </Boards>
        <TrashCan/>
      </Wrapper>
    </DragDropContext>
    </>
  );
}

export default App;
