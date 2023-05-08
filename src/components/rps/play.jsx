import React, {useState,useEffect} from "react";
import {toast} from "react-toastify";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import PropTypes from "prop-types";
import {Button} from "react-bootstrap";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import {play,p1wins,p2wins,draws,reveal,sum_array} from "../../utils/rpsgame";

import {useWallet} from "@txnlab/use-wallet";
import {useNavigate} from 'react-router-dom';


const Playreveal = ({address, fetchBalance, appid}) => {
    const [move, setmove] = useState("");
    const [loading, setLoading] = useState(false);
    const {signer} = useWallet();
    const navigate = useNavigate()

    useEffect(() => {
        fetchBalance(address)
        localStorage.setItem("sum", sum_array[0])
    })
    

    if (loading) {
	    return <Loader/>;
	}

    return (
        <div className="flex-column text-center min-vh-100">
            <h2>Appid: {appid}</h2>
         <div className="textboxes" style={{ display:"flex" , justifycontent:"center", alignitem:"center" ,margin: "0 auto", width: "12%"}}>
                <TextBoxComponent  placeholder="Enter Move" floatLabelType="Auto" onChange={(e) => {
                                    setmove(e.target.value)
                                }}/>
            </div>
            <div style={{ display:"flex" , justifycontent:"center", alignitem:"center"}}>
            <Button 
                    onClick={() => {
                        let data = {move}
                        play(address, data,signer, appid)
                        .then(() => {
                            toast(<NotificationSuccess text="Play was sucessfull."/>);
                            fetchBalance(address);
                        })
                        .catch(error => {
                            console.log(error);
                            toast(<NotificationError text="Making play was unsucessfull."/>);
                            setLoading(false);
                        })
                       
                    }}
                    variant='dark'
                    className="rounded-pill px-0"
                    disabled = {localStorage.getItem("sum") >= 2 }
                    style={{ margin: "10px auto", width: "10%"}}>
                        play
            </Button>
            </div>
            
            
            <div style={{ display:"flex" , justifycontent:"center", alignitem:"center"}}>
            <Button 
                    onClick={() => {
                        reveal(address,signer, appid)
                            .then(() => {
                                //let sum = p1wins + p2wins + draws
                                toast(<NotificationSuccess text=" Reavel successful"/>);
                                fetchBalance(address);
                                //localStorage.setItem("sum", sum)
                            })
                            .catch(error => {
                                console.log(error);
                                toast(<NotificationError text="Error occured."/>);
                                setLoading(false);
                            })
                        
                    }}
                    variant='dark'
                    className="rounded-pill px-0"
                    disabled = {localStorage.getItem("sum") >= 2 }
                    style={{ margin: "10px auto", width: "10%"}}>
                        Reveal winner
            </Button>
            </div>
            <div style={{ display:"flex" , justifycontent:"center", alignitem:"center"}}>
            <Button 
                    onClick={() => {
                        navigate('/')
                        window.location.reload()
                    }}
                    variant='dark'
                    className="rounded-pill px-0"
                    disabled = {localStorage.getItem("sum") < 2 }
                    style={{ margin: "10px auto", width: "10%"}}>
                        Restart
            </Button>
            </div>
           


        <h4>Game rules</h4>
        <p>1 Both players can register play in no certain order i.e regardless of player status</p>
        <p>2 Player 2 must click the reveal winner button first, then player 1 clicks in that order</p>
        <p>3 Both players can click the Restart button after 3 rounds of play in no certain order</p>



        <h5>Player1_count:{p1wins}</h5>     
        <h5>Player2_count:{p2wins}</h5>
        <h5>Draw_count:{draws}</h5>
            
        </div>    
    );
};

Playreveal.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired,
};

export default Playreveal;