import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled  from "styled-components";
import { toDoState } from "./atoms";
import Board from "./components/Board";

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
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
    const {destination, draggableId, source} = info;
    if(destination?.droppableId === source.droppableId){
      //same board movement
      setToDos(prev => {
        const boardCopy = [...prev[source.droppableId]];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, draggableId);
        return {
          ...prev,
          [source.droppableId]:boardCopy
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
      </Wrapper>
    </DragDropContext>
    </>
  );
}

export default App;
