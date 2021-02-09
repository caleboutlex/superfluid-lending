import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, ConnectButton, Header, Image, Link, Wrapper, SpaceWrapper, Title, ConnectWrapper, NavWrapper, TitleWrapper } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

import BalancePanel from './components/balancepanel/userBalance.component';
import MintingPanel from './components/mintingpanel/mintingpanel.component';
import Info from "./components/info/info.component";
import Table from "./components/table/table.component";
import RedeemPanel from "./components/redeempanel/redeempanel.component";
import AdminPanel from "./components/adminpanel/adminpanel.component";


async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <ConnectWrapper>
      <ConnectButton
        onClick={() => {
          if (!provider) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
            }
         }}
        >
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </ConnectButton>
    </ConnectWrapper>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  React.useEffect(() => {
   
  }, []);



  return (
    <div>
      <Body>
        <Header>
          <SpaceWrapper>
            <TitleWrapper>
              <Title> Superfluid Lending Demo </Title>
            </TitleWrapper>
            <NavWrapper>
              
            </NavWrapper>
            <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
          </SpaceWrapper>
        </Header>
        <Wrapper>
          <BalancePanel name={"Contract"} userNetFlow={1} daixBalance={100} daiBalance={200} cDaiContractBalance={300} />
        </Wrapper>
        <Wrapper>
          <BalancePanel name={"User"} userNetFlow={1} daixBalance={100} daiBalance={200} cDaiContractBalance={300} />
        </Wrapper>
        <Wrapper>
          <AdminPanel/>
        </Wrapper>
        <Wrapper>
          <MintingPanel/>
        </Wrapper>
        <Wrapper>
          <RedeemPanel/>
        </Wrapper>
        <Wrapper>
          <Table/>
        </Wrapper>
      </Body>
    </div>
  );
}

export default App;

