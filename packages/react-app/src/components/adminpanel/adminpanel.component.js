import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { abis, addresses } from "@project/contracts"

import { Button1, AdminButton, Button3, StyledDiv, SpaceWrapper, Card} from "../index";

const AdminPanel = () => {
    const { account, library, chainId } = useWeb3React();

    const [message, setMessage] = useState();
    const [loading, setLoading] = useState(false);

    const onUpgradeAndApprove = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
  
      }
    
    const onApproveDAI = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
    
        
      }
    
    const onRebalance = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
    
       
      }

    const onWithdrawDai = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
    
       
      }
    
    const onWithdrawDaix = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Waiting on transaction succes.....');
    
       
      }
    
    return(
        <Card>
            <SpaceWrapper>
              <StyledDiv>
                <AdminButton onClick={onRebalance}>
                   Rebalance
                </AdminButton>
              </StyledDiv>
    
              <StyledDiv>
                <AdminButton onClick={onApproveDAI}>
                    Approve Dai
                </AdminButton>
              </StyledDiv>
              <StyledDiv>
                <AdminButton onClick={onWithdrawDai}>
                    Withdraw Dai
                </AdminButton>
              </StyledDiv>
              <StyledDiv>
                <AdminButton onClick={onWithdrawDaix}>
                  Withdraw Daix
                </AdminButton>
              </StyledDiv>
              <StyledDiv>
                <AdminButton onClick={onUpgradeAndApprove}>
                    Unwrap All User DaiX
                </AdminButton>
              </StyledDiv>
            </SpaceWrapper>
        </Card>
    )

}

export default AdminPanel; 