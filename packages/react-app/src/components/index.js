import styled from "styled-components";

export const Header = styled.header`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: #141414;
`;

export const Body = styled.body`
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  font-size: calc(6px + 2vmin);
  line-height: 1.2em;
  justify-content: space-evenly;
  min-height: 100vh;
  position: absolute; 
  background: #fafafa;
  background-image: url('https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

`;


export const Title = styled.h2`
  font-size: calc(10px + 2vmin);
  font-weight: 800;
  margin-left: 25px;
  border-width-bottom: 5px;
  border-bottom: 5px #8B2D8B;
`
export const Note = styled.p`
  font-size: calc(10px + 1vmin);
  margin: 25px;
  font-style: italic; 
`

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #fff;
`




export const Container = styled.div`
  width: 100%;
  display: flex; 
  justify-content: center; 
  align-items: center;
`

export const RowWrapper = styled.div`
  width: 100%;
  display: flex; 
  flex-wrap: no-wrap; 
  flex-direction: row; 
  justify-content: center; 
`

export const ColumnWrapper = styled.div`
  width: 100%;
  display:flex;
  flex-direction: column;
  align-items: center;
`
export const Wrapper = styled.div`
  width: 100%;
  display:flex; 
  flex-direction: column; 
  align-items: flex-start;

`

export const InputWrapper = styled.div`
  width: 100%;
  display: flex; 
  flex-direction: row; 
  justify-content: flex-end; 
  margin: 10px;
  
`
export const Label = styled.div`
  font-size: calc(2px + 1.6vmin);
  font-weight: 600;
  margin-right: 10px;
  flex-wrap: no-wrap;
`
export const StyledInput = styled.input`
    width: 50%;
    padding: 5px; 
    border-width: 3px;
    border-radius: 5px;
    border-color: #F37222;

`





export const ConnectWrapper = styled.div`
  width: 20%;
  font-size: calc(5px + 2vmin);
  font-weight: 200;
`
export const NavWrapper = styled.div`
  min-width: 50%;
  font-size: calc(5px + 2vmin);
  font-weight: 200;
`



export const ConnectButton = styled.button`
  width: 90%;
  text-align: center;
  border-color: #F89D2F;
  border-width: 4px;
  border-radius: 8px;
  
  color: white;
  padding: 16px 35px;

  font-weight: 600;

  background: #292C2E;

`
export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;

`
export const AdminButton = styled.button`
  text-align: center;
  border-color: #141414;
  border-width: 2px;
  border-radius: 8px;

  color: white;
  padding: 16px 35px;

  font-weight: 600;

  background: #070E14;
`


export const Button1 = styled.button`

  text-align: center;
  border-color: #00787A;
  border-width: 2px;
  border-radius: 8px;

  color: white;
  padding: 16px 35px;

  font-weight: 600;

  background: #070E14;
  

`
export const Button2 = styled.button`

  text-align: center;
  border-color: #FB6107;
  border-width: 2px;
  border-radius: 8px;

  color: white;
  padding: 16px 35px;

  font-weight: 600;

  background: #070E14;
 
  

`
export const Button3 = styled.button`

  text-align: center;
  border-color: #8B2D8B;
  border-width: 2px;
  border-radius: 8px;

  color: white;
  padding: 16px 35px;

  font-weight: 600;

  background: #070E14;
  
`

export const LinkButton = styled.div`
  
  display: flex;
  a{
    position: relative;
    background: #DC2E33;
    border: none;
    color: #fff;
    padding: 16px 45px;
    box-shadow: 0px 0px 4px #E15155;

    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
  }
  
`;



export const StyledDiv = styled.div`
    display: flex;
    flex-direction: column ;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    margin: 10px;
`

export const Span = styled.span`
  ${({ color }) => `color: ${color}`}
  
`;

export const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  padding: 30px;
  margin: 30px;

  color: #141414;
  background: #fafafa;

  font-size: calc(6px + 1vmin);
  box-shadow: 0 1px 3px #F47723;

  border-color: #141414;
`
export const InfoCard = styled.div`
  width: 100%;  
  min-height: 10vh;   
  display: flex;
  
  align-items: center;
  justify-content: space-evenly;
  margin: 30px;

  color: #fafafa;

  background: rgb(255,106,0);
  background: linear-gradient(90deg, rgba(255,106,0,1) 56%, rgba(255,137,2,1) 92%);

  font-size: calc(6px + 1vmin);
  box-shadow: 0 1px 3px #292C2E;

  border-color: #141414;
  border-width: 2px;
`