import styled from 'styled-components';


export const DateTimePicker = styled.form`
    font-size: 25px;

`
export const StyledDatepicker = styled.div`

`

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


;