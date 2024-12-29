import { styled } from "styled-components";
import { TrashBin } from "../assets/Icons";
import { StrictModeDroppable } from "../util";

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
  width: 80px;
  height: 80px;
  background-color: transparent;
  bottom: 6rem;
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
  width: 50px;
  height: 50px;
  background: ${(props) =>
    props.isDraggingOver
      ? props.theme.secondaryAccent
      : props.theme.gradients.primary};
  border: ${(props) => props.theme.borders.pixel};
  border-radius: 50%;
  box-shadow: 4px 4px 0 rgba(45, 0, 102, 0.2);
  transition: all 0.3s ease;

  svg {
    fill: ${(props) =>
      props.isDraggingOver
        ? props.theme.textPrimary
        : props.theme.primaryAccent};
    width: 20px;
    transition: fill 0.3s ease;
  }

  &:hover {
    transform: scale(1.1) rotate(-5deg);
  }

  &::before {
    content: "✨";
    position: absolute;
    top: -5px;
    left: -5px;
    font-size: 12px;
    color: ${(props) => props.theme.secondaryAccent};
  }

  &::after {
    content: "✨";
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: 12px;
    color: ${(props) => props.theme.primaryAccent};
  }
`;

interface ITrashCanProps {
  show: boolean;
}
function TrashCan({ show }: ITrashCanProps) {
  return (
    <>
      <StrictModeDroppable droppableId="trashBin" isDropDisabled={!show}>
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
      </StrictModeDroppable>
    </>
  );
}

export default TrashCan;
