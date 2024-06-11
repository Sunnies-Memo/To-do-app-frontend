import { Droppable } from "react-beautiful-dnd";
import DragableCard from "./DragableCard";
import React, { useRef } from "react";
import { styled } from "styled-components";

interface IAreaProps{
    isDraggingOver:boolean;
    isDraggingFromThis:boolean;
}

const Area = styled.div<IAreaProps>`
    background-color: ${props => props.isDraggingOver? "blue" : props.isDraggingFromThis? "red" : "dimgray"};
    flex-grow: 1;
    transition: background-color .3s ease-in-out;
    padding: 10px;
    border-radius: 5px;
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
const Wrapper = styled.div`
    width: 250px;
    background-color: ${props => props.theme.boardColor};
    padding: 10px 5px;
    border-radius: 5px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
`
interface IBoardProps{
    toDos: string[];
    boardId: string;
}
function Board({toDos,boardId}:IBoardProps){
    const inputRef = useRef<HTMLInputElement>(null);
    const onClick = () => {
        inputRef.current?.focus();
        setTimeout(()=>{
            inputRef.current?.blur();
        },5000)
    }
    return(
        <Wrapper>
            <Title><span>{boardId}</span></Title>
            <input ref={inputRef} placeholder="grab me"/>
            <button onClick={onClick}>click me</button>
            <Droppable droppableId={boardId}>
                {(magic,snapshot) => 
                <Area 
                    ref={magic.innerRef} 
                    {...magic.droppableProps} 
                    isDraggingOver={snapshot.isDraggingOver}
                    isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
                >
                    {toDos.map((todo, index) => 
                    <DragableCard key={todo} index={index} todo={todo}/>
                    )}
                    {magic.placeholder}
                </Area>
                }
            </Droppable>
        </Wrapper>
    )
}

export default React.memo(Board);