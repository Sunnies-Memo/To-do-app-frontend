import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { styled } from "styled-components";
const Card = styled.div`
  background-color: ${props => props.theme.cardColor};
  padding: 10px 10px;
  border-radius: 5px;
  margin-bottom: 5px;
`

interface IDragalbeCard{
    todo:string;
    index:number
}
function DragableCard({todo, index}:IDragalbeCard){
    return(
        <Draggable key={todo} draggableId={todo} index={index}>
            {(magic) => 
            <Card 
                ref={magic.innerRef} 
                {...magic.draggableProps} 
                {...magic.dragHandleProps}
            >
                {todo}
            </Card>}
        </Draggable>
    )
};

export default React.memo(DragableCard);