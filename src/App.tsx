import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled  from "styled-components";
import { toDoState } from "./atoms";

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

const Board = styled.div`
  background-color: ${props => props.theme.boardColor};
  padding-top: 30px;
  padding: 20px 10px;
  border-radius: 5px;
  min-height: 200px;
`
const Card = styled.div`
  background-color: ${props => props.theme.cardColor};
  padding: 10px 10px;
  border-radius: 5px;
  margin-bottom: 5px;
`

function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const onDragEnd = ({draggableId, destination, source}:DropResult) => {
    if(!destination) return;
    setToDos(prev => {
      const copyToDos = [...prev];
      //1. 원래 배열에서 요소 삭제
      copyToDos.splice(source.index,1); //소스에서 1개 삭제
      
      //2. 목표 배열에 요소 추가
      copyToDos.splice(destination?.index, 0, draggableId);

      return copyToDos;
    })
  }
    return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper>
        <Boards>
          <Droppable droppableId="one">
            {(magic) => 
            <Board ref={magic.innerRef} {...magic.droppableProps}>
              {toDos.map((todo, index) => 
              <Draggable key={todo} draggableId={todo} index={index}>
                {(magic) => 
                <Card 
                  ref={magic.innerRef} 
                  {...magic.draggableProps} 
                  {...magic.dragHandleProps}
                >
                  {todo}
                </Card>}
              </Draggable>)}
              {magic.placeholder}
            </Board>
            }
          </Droppable>
        </Boards>
      </Wrapper>
    </DragDropContext>
    </>
  );
}

export default App;
