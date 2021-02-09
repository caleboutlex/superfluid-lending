import styled from "styled-components";
export const StyledBox = styled.div`
  padding: 22px;
  margin: 8px 0;
`

export const RowWrapper = styled.div`
  display:flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 90%;
`
export const ColumnWrapper = styled.div`
  margin: 0 0 0 70px ;
  word-wrap:break-word;

`
export const Wrapper = styled.div`
  display:flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  padding: 12px;
`
export const CenterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  height: 50vh
`

export const StyledDiv = styled.div`
  display: flex; 
  flex-direction: column;
  justify-content: space-between; 
  width: 100%;
  min-height: 50vh;
  width: 90%;
`