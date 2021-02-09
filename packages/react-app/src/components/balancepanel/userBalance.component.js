import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import AnimatedNumber from "animated-number-react";

import { Span, SpaceWrapper, StyledForm, InfoCard, Label } from "../index";

const CurrentBalance = ({userNetFlow, daixBalance, name}) => {
    const { account, library, chainId } = useWeb3React();
    const [daixBalanceFake, setDaixBalanceFake] = useState();

    useEffect(() => {
        setDaixBalanceFake(daixBalance);
    },[daixBalance]);

    const flowForHumans = (flow, cadence = " DAIx/month") => {
        return (flow * ((3600 * 24 * 30) / 1e18)).toFixed(8) + cadence;
      }

    const increaseBalance = (value) => {
        // console.log("Increase NetFlow: ", Number(userNetFlow) );
        // console.log("daixBalanceFake before: ", daixBalanceFake);
        var newBalance = Number(daixBalanceFake) + Number((Number(userNetFlow) * 5) / 1e18);
        if (
          (userNetFlow < 0 && newBalance < daixBalanceFake) ||
          (userNetFlow > 0 && newBalance > daixBalanceFake)
        ) {
            setDaixBalanceFake(newBalance);
        }
      }

    return(
        <InfoCard>
            <SpaceWrapper>
                <Label> {name} Balance: </Label>  
                <AnimatedNumber
                    value={daixBalanceFake}
                    complete={increaseBalance}
                    duration={5000}
                    formatValue={n => ` ${n.toFixed(6)} ` +
                    '...DAIx'}
                        />
              
                <Label> Net Flow: </Label>
                <Span color={userNetFlow > 0 ? "green" : "red"}>
                {flowForHumans(userNetFlow)}
                </Span>
            </SpaceWrapper>
        </InfoCard>
    )
}

export default CurrentBalance;