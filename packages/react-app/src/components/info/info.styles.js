import styled from 'styled-components';

export const InfoMessage = styled.div`
    position: fixed;
    z-index: 999;
    top:13%;
    left: 50%;
    transform: translateX(-50%);
    div{
        padding: 10px;
        font-size: 16px;
        background: #27ae60;
        font-weight: 600;
    }
    div:empty{
        display:none;
    }
`
export const StyledTable = styled.div`

`

export const StyledRow = styled.div`
    display:flex; 
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    font-size: 12px !important;
    
`
export const StyledItem = styled.div`
    border: solid white;
    background-color: #f0efeb !important;
    min-width: 120px;
    padding: 5% 8%;
`
export const StyledAddress = styled.div`
   
`
export const StyledButton = styled.div`
    min-width: 120px;
`

export const StyledTableHeader = styled.div`
    display:flex; 
    flex-wrap: no-wrap;
    flex-direction: row;
    justify-content: flex-start;
    padding: 5% 8%;
    min-width: 120px;
    font-size: 14px !important;
    
` 
export const Button = styled.button`
  background: #fff;
  border: none;
  border-radius: 4px;
  padding: 5% 8%;
  color: #000;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  box-shadow: 0px 0px 4px #ccc;
`
;