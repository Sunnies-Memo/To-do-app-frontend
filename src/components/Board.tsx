import { Droppable } from "react-beautiful-dnd";
import DragableCard from "./DragableCard";
import React from "react";
import { styled } from "styled-components";

const Wrapper = styled.div`
  background-color: ${props => props.theme.boardColor};
  padding-top: 30px;
  padding: 20px 10px;
  border-radius: 5px;
  min-height: 200px;
`
interface IBoardProps{
    toDos: string[];
    boardId: string;
}
function Board({toDos,boardId}:IBoardProps){
    return(
        <Droppable droppableId={boardId}>
            {(magic) => 
            <Wrapper ref={magic.innerRef} {...magic.droppableProps}>
                {toDos.map((todo, index) => 
                <DragableCard key={todo} index={index} todo={todo}/>
                )}
            {magic.placeholder}
            </Wrapper>
            }
        </Droppable>
    )
}

export default React.memo(Board);