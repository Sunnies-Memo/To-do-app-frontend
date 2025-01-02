import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRecoilCallback, useRecoilValue } from "recoil";
import {
  boardAtomFamily,
  orderedBoardList,
  userToken,
  userNameSelector,
} from "../atoms";
import { moveBoard, moveToDo } from "../api/todo-api";
import { IBoard, IBoardUpdate, ITodo } from "../interface/todo-interface";

/**
 * 드래그 앤 드롭되는 아이템의 기본 정보를 정의하는 인터페이스
 */
interface DragItem {
  id: string;
  type: "BOARD" | "CARD";
  sourceIndex: number;
  boardId?: string;
}

export const useDragAndDrop = () => {
  const token = useRecoilValue(userToken);
  const userName = useRecoilValue(userNameSelector);

  /**
   * 드래그 앤 드롭을 위한 센서 설정
   * - PointerSensor: 마우스/터치 입력 처리 (5px 이상 이동 시 활성화)
   * - KeyboardSensor: 키보드 접근성 지원
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  /**
   * 새로운 정렬 인덱스를 계산하는 유틸리티 함수
   * @param prevIndex 이전 아이템의 orderIndex
   * @param nextIndex 다음 아이템의 orderIndex
   * @returns 새로운 orderIndex 값
   */
  const calculateNewIndex = (
    prevIndex: number | null,
    nextIndex: number | null
  ): number => {
    if (prevIndex != null && nextIndex != null) {
      return Math.floor((prevIndex + nextIndex) / 2);
    } else if (prevIndex == null && nextIndex != null) {
      return Math.floor(nextIndex / 2);
    } else if (nextIndex == null && prevIndex != null) {
      return prevIndex + 10;
    }
    return 10; // 기본값
  };

  /**
   * 드래그 시작 시 호출되는 핸들러
   * 드래그 시작 상태를 초기화하고 필요한 데이터를 준비
   */
  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      async (event: DragStartEvent) => {
        const { active } = event;
        const draggedItem = active.data.current as DragItem;
        // 추가적인 드래그 시작 로직이 필요한 경우 여기에 구현
      }
  );

  /**
   * 드래그 오버 시 호출되는 핸들러
   * 다른 보드로 카드를 드래그할 때의 임시 UI 업데이트 처리
   */
  const handleDragOver = useRecoilCallback(
    ({ snapshot, set }) =>
      async (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const draggedItem = active.data.current as DragItem;
        const targetItem = over.data.current as DragItem;

        // 다른 보드로 카드 드래그시 임시 UI 업데이트
        if (
          draggedItem.type === "CARD" &&
          targetItem.type === "BOARD" &&
          draggedItem.boardId !== targetItem.id
        ) {
          const sourceBoard = await snapshot.getPromise(
            boardAtomFamily(draggedItem.boardId!)
          );

          // 소스 보드에서 카드 제거
          set(boardAtomFamily(draggedItem.boardId!), (prev: IBoard) => ({
            ...prev,
            toDoList: prev.toDoList?.filter(
              (_, idx) => idx !== draggedItem.sourceIndex
            ),
          }));

          // 타겟 보드에 카드 추가
          set(boardAtomFamily(targetItem.id), (prev: IBoard) => ({
            ...prev,
            toDoList: [
              ...(prev.toDoList || []),
              sourceBoard.toDoList![draggedItem.sourceIndex],
            ],
          }));
        }
      }
  );

  /**
   * 드래그 종료 시 호출되는 핸들러
   * 보드 또는 카드의 최종 위치 업데이트 및 API 호출 처리
   */
  const handleDragEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const draggedItem = active.data.current as DragItem;
        const targetItem = over.data.current as DragItem;

        // 보드 이동 처리
        if (draggedItem.type === "BOARD") {
          const orderedBoards = await snapshot.getPromise(orderedBoardList);
          const sourceIdx = draggedItem.sourceIndex;
          const destinationIdx = targetItem.sourceIndex;

          // 이전/다음 인덱스 계산
          const prevIndex =
            destinationIdx > 0
              ? orderedBoards[destinationIdx - 1].orderIndex
              : null;
          const nextIndex =
            destinationIdx < orderedBoards.length - 1
              ? orderedBoards[destinationIdx].orderIndex
              : null;

          const newIndex = calculateNewIndex(prevIndex, nextIndex);
          const gap = nextIndex ? nextIndex - newIndex : 999;

          // Recoil 상태 업데이트
          set(orderedBoardList, (prev) => {
            const boardsCopy = [...prev];
            const [removed] = boardsCopy.splice(sourceIdx, 1);
            boardsCopy.splice(destinationIdx, 0, {
              ...removed,
              orderIndex: newIndex,
            });
            return boardsCopy;
          });

          // API 호출
          const boardUpdate: IBoardUpdate = {
            boardId: draggedItem.id,
            orderIndex: newIndex,
            title: orderedBoards[sourceIdx].title,
            username: userName,
          };
          await moveBoard(boardUpdate, gap, token);

          // 카드 이동 처리
        } else if (draggedItem.type === "CARD") {
          const sourceBoard = await snapshot.getPromise(
            boardAtomFamily(draggedItem.boardId!)
          );
          const targetBoard = await snapshot.getPromise(
            boardAtomFamily(targetItem.id)
          );

          const sourceCards = sourceBoard.toDoList || [];
          const targetCards = targetBoard.toDoList || [];

          // 이전/다음 인덱스 계산
          const prevIndex =
            targetItem.sourceIndex > 0
              ? targetCards[targetItem.sourceIndex - 1].orderIndex
              : null;
          const nextIndex =
            targetItem.sourceIndex < targetCards.length
              ? targetCards[targetItem.sourceIndex].orderIndex
              : null;

          const newIndex = calculateNewIndex(prevIndex, nextIndex);
          const gap = nextIndex ? nextIndex - newIndex : 999;

          // 업데이트할 카드 데이터 준비
          const updatedCard: ITodo = {
            ...sourceCards[draggedItem.sourceIndex],
            board: { boardId: targetItem.id },
            orderIndex: newIndex,
          };

          // Recoil 상태 업데이트
          set(boardAtomFamily(draggedItem.boardId!), (prev: IBoard) => ({
            ...prev,
            toDoList: prev.toDoList?.filter(
              (_, idx) => idx !== draggedItem.sourceIndex
            ),
          }));

          set(boardAtomFamily(targetItem.id), (prev: IBoard) => ({
            ...prev,
            toDoList: arrayMove(
              prev.toDoList || [],
              draggedItem.sourceIndex,
              targetItem.sourceIndex
            ),
          }));

          // API 호출
          await moveToDo(updatedCard, gap, token);
        }
      }
  );

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
