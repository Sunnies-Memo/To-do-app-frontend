import { Droppable } from "react-beautiful-dnd";
import { styled } from "styled-components";
import { TrashBin } from "../assets/Icons";

interface IDeleteTodoBox {
  isDraggingOver: boolean;
}
interface IWrapper {
  show: boolean;
}
const Wrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 80px;
  background-color: transparent;
  bottom: 15px;
`;
const TrashCanWrapper = styled.div<IWrapper>`
  display: ${(props) => (props.show ? "flex" : "none")};
  position: absolute;
  justify-content: center;
  align-items: center;
`;
const DeleteToDoBox = styled.div<IDeleteTodoBox>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: ${(props) => props.theme.boardColor};
  border-radius: 5px;
  svg {
    fill: ${(props) => (props.isDraggingOver ? "#FA4A23" : "dimgray")};
    width: 20px;
  }
`;
interface ITrashCanProps {
  show: boolean;
}
function TrashCan({ show }: ITrashCanProps) {
  return (
    <>
      <Droppable droppableId="trashBin" isDropDisabled={!show}>
        {(magic, snapshot) => (
          <Wrapper
            className="TrashBin"
            ref={magic.innerRef}
            {...magic.droppableProps}
          >
            <TrashCanWrapper show={show}>
              <DeleteToDoBox isDraggingOver={snapshot.isDraggingOver}>
                <TrashBin />
              </DeleteToDoBox>
            </TrashCanWrapper>
            {magic.placeholder}
          </Wrapper>
        )}
      </Droppable>
    </>
  );
}

export default TrashCan;
