import { ThemeProvider } from "styled-components";
import { Reset } from "./GlobalStyle";
import { darkTheme } from "./theme";
import { useRecoilState, useRecoilValue } from "recoil";
import { hourSelector, minuteState } from "./atoms";

function App() {
  const [minutes, setMinutes] = useRecoilState(minuteState);
  const [hours, setHours] = useRecoilState(hourSelector); // selector 의 반환값 첫번째 arg는 get의 리턴값, 두번째 arg는 set함수
  const onMinutesChange = (event:React.FormEvent<HTMLInputElement>) => {
    setMinutes(+event.currentTarget.value);
  }
  const onHoursChange = (event:React.FormEvent<HTMLInputElement>) => {
    setHours(+event.currentTarget.value);
  }
    return (
    <>
    <ThemeProvider theme={darkTheme}>
      <Reset/>
      <input value={minutes} onChange={onMinutesChange} type="number" placeholder="Minutes"/>
      <input value={hours} onChange={onHoursChange} type="number" placeholder="Hours"/>
    </ThemeProvider>
    </>
  );
}

export default App;
