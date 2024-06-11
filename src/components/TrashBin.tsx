import { Droppable } from "react-beautiful-dnd";
import { styled } from "styled-components";
import { TrashBin } from "../assets/Icons";

interface IDeleteTodoBox{
    isDraggingOver:boolean;
}
const DeleteToDoBox = styled.div<IDeleteTodoBox>`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.boardColor};
  border-radius: 5px;
  bottom: 15px;
  svg{
    fill: ${props=>props.isDraggingOver? "red" : "dimgray"};
    width: 20px;
  }
`
function TrashCan(){
    return(
        <>
        <Droppable droppableId="trashBin">
            {(magic,snapshot) => 
            <DeleteToDoBox
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
            >
                {magic.placeholder}
                <TrashBin/>
            </DeleteToDoBox>
            }
        </Droppable>
        </>
    )
}

export default TrashCan;