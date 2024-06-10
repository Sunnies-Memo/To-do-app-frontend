import { Droppable } from "react-beautiful-dnd";
import DragableCard from "./DragableCard";
import React from "react";
import { styled } from "styled-components";

const Wrapper = styled.div`
  width: 250px;
  background-color: ${props => props.theme.boardColor};
  padding-top: 30px;
  padding: 20px 10px;
  border-radius: 5px;
  min-height: 200px;
`
const Title = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    span{
        font-size: 15px;
        font-weight: bold;
    }
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
                <Title><span>{boardId}</span></Title>
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