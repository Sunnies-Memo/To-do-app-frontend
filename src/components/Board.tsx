import { Droppable } from "react-beautiful-dnd";
import DragableCard from "./DragableCard";
import { styled } from "styled-components";
import { useForm } from "react-hook-form";
import { ITodo, toDoState } from "../atoms";
import { useSetRecoilState } from "recoil";
import React from "react";

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
const Form = styled.form`
    input{
        width: 100%;
    }
`
interface IBoardProps{
    toDos: ITodo[];
    boardId: string;
}
interface IForm{
    toDo:string
}
function Board({toDos,boardId}:IBoardProps){
    const {register,handleSubmit,setValue} = useForm<IForm>();
    const setToDos = useSetRecoilState(toDoState);
    const onValid = ({toDo}:IForm) => {
        const newToDo:ITodo = {
            id:Date.now(),
            text:toDo
        };
        setToDos(prev => {
            const newToDoObj = {
                ...prev,
                [boardId]:[newToDo,...prev[boardId]]
            }
            localStorage.setItem("TODO",JSON.stringify(newToDoObj))
            return newToDoObj;
        });
        setValue("toDo","");
    };
    return(
        <Wrapper>
            <Title><span>{boardId}</span></Title>
            <Form onSubmit={handleSubmit(onValid)}>
                <input {...register("toDo",{required:true})} type="text" placeholder={`Add task on ${boardId}`}/>
            </Form>
            <Droppable droppableId={boardId}>
                {(magic,snapshot) => 
                <Area 
                    ref={magic.innerRef} 
                    {...magic.droppableProps} 
                    isDraggingOver={snapshot.isDraggingOver}
                    isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
                >
                    {toDos.map((todo, index) => 
                    <DragableCard key={todo.id} index={index} toDoId={todo.id} toDoText={todo.text}/>
                    )}
                    {magic.placeholder}
                </Area>
                }
            </Droppable>
        </Wrapper>
    )
}

export default React.memo(Board);