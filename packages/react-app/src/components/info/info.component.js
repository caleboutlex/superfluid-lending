import React, {useState} from 'react';
import { useWeb3React } from '@web3-react/core';

import { abis, addresses } from "@project/contracts"

import { convertUnixToTimeStamp } from "../../utils/utils";

import { Button1, StyledInput, Flexwrapper, StyledDiv, Card} from "../index";



const Info = () => {
    const { account, library, chainId } = useWeb3React();

    const [info, setInfo] = useState([])
    const [value, setValue] = useState(0);
    const [agreementID, setID] = useState("");
    const [endDate, setEndDate] = useState("");
    const [listPrice, setListPrice] = useState("");
    const [totalPrice, setTotalPrice] = useState("");
    const [downpayment, setDownpayment] = useState("");
    const [amountInvested, setAmountInvested] = useState("");
    const [amountPerSecond, setAmountPerSecond] = useState("");
    const [buyer, setBuyer] = useState("");
    const [seller, setSeller] = useState("");
    const [state, setState] = useState("");
    const [pending, setPending] = useState("");
    const [totalPending, setTotalPending] = useState("");

    const fetchinfo = async () => {
        
    }

    const handleChange = async (e) => {
        e.preventDefault();
        let id = e.target.value;
        setValue(id);
      }

    return (
        <Card>
            <Flexwrapper>
                <StyledInput  
                    value={value} 
                    onChange={handleChange}
                />
                <Button1 onClick={fetchinfo}> Get Info </Button1>
            </Flexwrapper>   
        </Card>
    )
}

export default Info;