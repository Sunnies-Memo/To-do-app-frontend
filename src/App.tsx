import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled  from "styled-components";
import { toDoState } from "./atoms";
import Board from "./components/Board";

const Wrapper = styled.div`
  display: flex;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
const Boards = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(1, 1fr);
`



function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const onDragEnd = ({draggableId, destination, source}:DropResult) => {
    // if(!destination) return;
    // setToDos(prev => {
    //   const copyToDos = [...prev];
    //   //1. 원래 배열에서 요소 삭제
    //   copyToDos.splice(source.index,1); //소스에서 1개 삭제
      
    //   //2. 목표 배열에 요소 추가
    //   copyToDos.splice(destination?.index, 0, draggableId);

    //   return copyToDos;
    // })
  }
    return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper>
        <Boards>
         {Object.keys(toDos).map(boardId => <Board boardId={boardId} key={boardId} toDos={toDos[boardId]}/>)}
        </Boards>
      </Wrapper>
    </DragDropContext>
    </>
  );
}

export default App;
