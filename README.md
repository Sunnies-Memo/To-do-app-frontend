# 칸반 보드 애플리케이션

## 프로젝트 개요

이 프로젝트는 React와 TypeScript를 기반으로 한 칸반 보드 애플리케이션입니다. 사용자는 보드를 생성하고 할 일을 관리할 수 있으며, 드래그 앤 드롭으로 작업을 재배치할 수 있습니다.

## 주요 기능

- 사용자 인증 (로그인/회원가입)
- 칸반 보드 CRUD
- 드래그 앤 드롭으로 작업 관리
- 프로필 관리 (이미지 업로드, 비밀번호 변경)
- 반응형 디자인

## 기술 스택

- **Frontend**:
  - React
  - TypeScript
  - Recoil (상태 관리)
  - React Query (서버 상태 관리)
  - Styled-components (스타일링)
  - React Beautiful DnD (드래그 앤 드롭)
  - React Hook Form (폼 관리)
  - Framer Motion (애니메이션)

## 주요 컴포넌트 구조

### 페이지 컴포넌트

- `Login.tsx`: 로그인 페이지
- `Join.tsx`: 회원가입 페이지
- `Todos.tsx`: 메인 칸반 보드 페이지
- `MyPage.tsx`: 사용자 프로필 관리 페이지
- `Maintenance.tsx`: 서비스 점검 페이지

### 기능 컴포넌트

- `Board.tsx`: 개별 칸반 보드
- `DraggableCard.tsx`: 드래그 가능한 작업 카드
- `BoardForm.tsx`: 새 보드 생성 폼
- `ImageDropzone.tsx`: 이미지 업로드 영역
- `Navigation.tsx`: 네비게이션 바
- `TrashBin.tsx`: 삭제를 위한 드롭 영역

## 상태 관리 전략

### React Query

- 보드 데이터 캐싱 (`["boards data", token]`)
- 사용자 프로필 캐싱 (`["userProfile"]`)
- 낙관적 업데이트 구현
- 자동 재시도 및 에러 처리

### Recoil

- 전역 상태 관리
  - `userState`: 사용자 정보
  - `orderedBoardList`: 보드 순서
  - `boardAtomFamily`: 개별 보드 상태
  - `cardListSelector`: 카드 목록

## 드래그 앤 드롭 구현

- react-beautiful-dnd 사용
- 보드 간 카드 이동
- 보드 순서 변경
- 휴지통 기능으로 삭제

## 인증 시스템

- JWT 기반 인증
- 토큰 자동 갱신
- 인증 상태 유지

## 이미지 처리

- 프로필 이미지 업로드
- 배경 이미지 설정
- react-dropzone 활용

## 성능 최적화

- React.memo를 사용한 컴포넌트 최적화
  - Board
  - DraggableCard
- React Query 캐싱 전략
  - staleTime: 15분
  - 낙관적 업데이트
- 조건부 렌더링 최적화

## 보안

- 비밀번호 정책
  - 최소 7자 이상
  - 문자, 숫자, 특수문자 포함
- API 인증
  - Bearer 토큰 사용
  - 토큰 갱신 메커니즘

## 에러 처리

- React Query 에러 처리
- 폼 유효성 검사 에러
- API 요청 실패 처리
- 유지보수 모드 지원

## 환경 설정

프로젝트는 다음 환경 변수를 사용합니다:

- `REACT_APP_SERVER_API`: API 서버 주소
- `REACT_APP_ISMAINTENANCE`: 유지보수 모드 플래그
