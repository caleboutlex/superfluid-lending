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

  background: #fafafa;
  background-image: url('https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

`;

export const Label = styled.label`
  width: 15%;
  font-size: calc(2px + 1.6vmin);
  font-weight: 600;
  margin-left: 5px;
`
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

export const Wrapper = styled.div`
  width: 95%;
  display:flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
  @media (max-width: 768px) {
    margin: 120px 0 0 0;
}
`
export const Flexwrapper = styled.div`
  width: 70%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 5px;
`
export const InfoTextWrapper = styled.div`
  width: 60%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const SpaceWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 20px;
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
export const TitleWrapper = styled.div`
  min-width: 30%;
  font-size: calc(5px + 2vmin);
  font-weight: 200;
`

export const ImageWrap = styled.div`
  width: 15%;
  display:flex;
  justify-content: flex-start;
`
export const Image = styled.img`
  height: 7vmin;
  margin-bottom: 16px;
  pointer-events: none;
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
  min-width: 15%;
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
  min-width: 15%;
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
  min-width: 15%;
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
  min-width: 15%;
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
export const StyledInput = styled.input`
    width: 45%;
    position: relative;
    z-index: 1;
    padding: 5px; 
    border-width: 3px;
    border-radius: 5px;
    border-color: #F37222;
    min-height: 25px;
    ::placeholder,
    ::-webkit-input-placeholder {
      color: #00000;
    }
`

export const StyledInfo = styled.div`
    position: relative;
    z-index: 1;
    padding: 5px; 
    border: none;
    border-radius: 5px;
    min-height: 25px;
    min-width: 320px;
    min-width: 400px;
`
export const StyledForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end ;
    justify-content: center;
    
`

export const StyledDiv = styled.div`
    display: flex;
    flex-direction: column ;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    margin: 10px;
`

export const StyledWrapper = styled.div`
    border-color: #932c2b !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    padding: 10px; 
    display: flex; 
    justify-content: center; 
`
export const Span = styled.span`
  ${({ color }) => `color: ${color}`}
  
`;

export const StyledTableHeader = styled.div`
  display: flex;
  flex-direction: row ;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin: 10px; 
`
export const Card = styled.div`
  width: 100%;    
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #141414;
  background: #fafafa;

  font-size: calc(6px + 1vmin);
  box-shadow: 0 1px 3px #F47723;

  border-color: #141414;
`
export const InfoCard = styled.div`
  width: 100%;    
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fafafa;

  background: rgb(255,106,0);
  background: linear-gradient(90deg, rgba(255,106,0,1) 56%, rgba(255,137,2,1) 92%);

  font-size: calc(6px + 1vmin);
  box-shadow: 0 1px 3px #292C2E;

  border-color: #141414;
  border-width: 2px;
`