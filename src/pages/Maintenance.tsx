import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: "#f5f5f5";
  text-align: "center";
`;
const Heading = styled.h1`
  font-size: 3em;
  color: tomato;
  margin-bottom: 20px;
`;

const Message = styled.p`
  font-size: 1.5rem;
  color: gray;
`;

const MaintenancePage: React.FC = () => {
  return (
    <Container>
      <Heading>서비스 점검 중</Heading>
      <Message>현재 시스템이 점검 중입니다. 잠시 후 다시 시도해주세요.</Message>
    </Container>
  );
};

export default MaintenancePage;
