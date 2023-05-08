import React, {useState} from "react";
import Cover from "./components/Cover";
import './App.css';
import Wallet from "./components/Wallet";
import {Container, Nav} from "react-bootstrap";
import Acceptchallenge from "./components/rps/accept_challenge";
import Challenge from "./components/rps/challenge";
import Playreveal from "./components/rps/play";
import Deploy from "./components/rps/deploy";
import {Notification} from "./components/utils/Notifications";
import coverImg from "./assets/img/rock-paper-scissors-neon-icons-vector.jpeg"
import {indexerClient,} from "./utils/constants";
import {Routes, Route} from 'react-router-dom';
import {Appid} from "./utils/rpsgame";
import image from "./assets/img2/img2.jpeg"

import {
  reconnectProviders,
  initializeProviders,
  WalletProvider,
  useWallet,
} from "@txnlab/use-wallet";


const walletProviders = initializeProviders() 

function App() {
 
  const [balance, setBalance] = useState(0);
  const {activeAddress} = useWallet();

  
  const fetchBalance = async (accountAddress) => {
    indexerClient.lookupAccountByID(accountAddress).do()
        .then(response => {
            const _balance = response.account.amount;
            setBalance(_balance);
        })
        .catch(error => {
            console.log(error);
        });
  };
  React.useEffect(() => {
    reconnectProviders(walletProviders);
    if (Appid[0] !== undefined){
      localStorage.setItem("Appid", Appid[0])
    }
  },[balance])

  const Main = ({address}) => (
    <Routes>
      <Route path='/' element={<Deploy address={address} fetchBalance={fetchBalance}/>}></Route>
      <Route path='/challenge' element={<Challenge address={address} fetchBalance={fetchBalance} appid={localStorage.getItem("Appid")}/>}></Route>
      <Route path='/accept_challenge' element={<Acceptchallenge address={address}  fetchBalance={fetchBalance} appid={Appid[0]}/>}></Route>
      <Route path='/play' element={<Playreveal  address={address} fetchBalance={fetchBalance} appid={localStorage.getItem("Appid")}/>}></Route>
    </Routes>
  )
  return (
    <>
    <Notification />
    {activeAddress? (
      <div style={{backgroundImage: `url(${image})`, backgroundRepeat:"no-repeat",backgroundSize:"cover",padding: "50px"}}>
    <Container fluid="md">
    <WalletProvider value={walletProviders}>
    <div style={{padding: "40px"}}>
    <Nav className="justify-content-end pt-3 pb-5">
      <Nav.Item>
          <Wallet
              address={activeAddress}
              name={activeAddress}
              amount={balance}
              symbol={"ALGO"}
          />
      </Nav.Item>
  </Nav>
    </div>
        
        <Main address={activeAddress} />
        
        
      </WalletProvider>
</Container></div>) : (<WalletProvider value={walletProviders}>
                    <Cover name={"Rock paper scissors"} coverImg={coverImg} />   
                  </WalletProvider>) }

  </>

    
  );
}

export default App;
