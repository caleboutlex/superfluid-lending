import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import { abis, addresses } from "@project/contracts"
import { Button1, StyledInput, InputWrapper, Note, Card, Label } from "../index";


const MintingPanel = () => {
    const { account, library, chainId } = useWeb3React();

    const [totalPrice, setTotalPrice] = useState();
    const [dwnpayment, setDwnpayment] = useState();
    const [buyer, setBuyer] = useState();
    const [seller, setSeller] = useState();
    const [interestPercent, setInterestPercent] = useState();
    const [years, setYears] = useState();

    const [message, setMessage] = useState();
    const [loading, setLoading] = useState(false);


    const handleChangeTotalPrice = (e) => {
        let totalPrice = e.target.value;
        setTotalPrice(totalPrice);
      }

    const handleChangeDownpayment = (e) => {
        let dwnpayment = e.target.value;
        setDwnpayment(dwnpayment);
      }
    
    const handleChangeBuyer = (e) => {
        let buyer = e.target.value;
        setBuyer(buyer);
      }
    
    const handleChangeSeller = (e) => {
        let seller = e.target.value;
        setSeller(seller);
      }
    
    const handleChangeInterestPercent = (e) => {
        let interestPercent = e.target.value;
        setInterestPercent(interestPercent);
      }
    
    const handleChangeYears = (e) => {
        let years = e.target.value;
        setYears(years);
      }
    

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
        let Contract;
        
        if (chainId === 5 ) {
            Contract = new library.eth.Contract(abis.EscrowAgent, addresses.EscrowAgent_goerli);
          } 
    
        await Contract.methods
                .mintAgreement(
                    library.utils.toWei(totalPrice.toString(), 'ether'),
                    interestPercent.toString(),
                    library.utils.toWei(dwnpayment.toString(), 'ether'),
                    years.toString(),
                    buyer, 
                    seller 

        ).send({
          from: account,
        }).then(function (result) {
          setMessage('Succes.....');
          setLoading(false);
        })
          .catch(
            function (e) {
              if (e.message.includes("User denied transaction signature")) {
                setMessage('Ser? Why you cancel?');
              } else {
                console.log("Error ! ")
              }
              setLoading(false);
            });
        setMessage('')
      }
    

    return (
        <Card>
          <h2> Mint a agreement</h2>
            <InputWrapper>
              <Label> The total price:</Label>
              <StyledInput  value={totalPrice} 
                      onChange={handleChangeTotalPrice}
                  />
            </InputWrapper>
            <InputWrapper>
              <Label>Downpayment:</Label>
              <StyledInput  value={dwnpayment} 
                    onChange={handleChangeDownpayment}
                />
            </InputWrapper>
            <InputWrapper>
              <Label> Buyer address: </Label>
              <StyledInput  value={buyer} 
                    onChange={handleChangeBuyer}
                />
            </InputWrapper>
            <InputWrapper>
              <Label> Seller address:</Label>
              <StyledInput  value={seller} 
                    onChange={handleChangeSeller}
                />
            </InputWrapper>
            <InputWrapper>
              <Label> Interest in %: </Label>
              <StyledInput  value={interestPercent} 
                    onChange={handleChangeInterestPercent}
                />
            </InputWrapper>
            <InputWrapper>
                <Label> Period in years: </Label>
                <StyledInput  value={years} 
                    onChange={handleChangeYears}
                />
            </InputWrapper>
            <Note> 
              Mint a NFT that represents the agreement between buyer and seller
            </Note>
          <Button1 onClick={onSubmit}> Mint </Button1> 
      </Card>
    ) 
}


export default MintingPanel;

