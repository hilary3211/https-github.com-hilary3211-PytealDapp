import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import PropTypes from "prop-types";
import {Button} from "react-bootstrap";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import {accept_challenge} from "../../utils/rpsgame";
import {useNavigate} from 'react-router-dom';
import {useWallet} from "@txnlab/use-wallet";


const Acceptchallenge = ({address, fetchBalance, appid}) => {
    const [wager, setwager] = useState(0);
    const [loading, setLoading] = useState(false);
    const {signer} = useWallet();
    
    useEffect(() => {
        if(appid !== undefined){
            localStorage.setItem("Appid2", appid)
        }
    }, [appid])
    const navigate = useNavigate()

    useEffect(() => {
        fetchBalance(address)
    })


    if (loading) {
	    return <Loader/>;
	}

    return (
        <div className="flex-column text-center min-vh-100">
        <h1>Player2</h1>
        <h2>Appid: {localStorage.getItem("Appid2")}</h2>
         <div className="textboxes" style={{ display:"flex" , justifycontent:"center", alignitem:"center" ,margin: "0 auto", width: "12%"}}>
                <TextBoxComponent  placeholder="Enter wager" floatLabelType="Auto" onChange={(e) => {
                                    setwager(e.target.value)
                                }}/>
            </div>
            <div style={{ display:"flex" , justifycontent:"center", alignitem:"center"}}>
            <Button 

                    onClick={() => {
                        let data = {wager}
                        if(wager >= 0.5 ){
                            accept_challenge(address,data,signer,localStorage.getItem("Appid2") )
                            .then(() => {
                                toast(<NotificationSuccess text="Challenge accepted sucessfully."/>);
                                fetchBalance(address);
                                navigate('/play')
                            })
                            .catch(error => {
                                console.log(error);
                                toast(<NotificationError text="Accepting challenge was unsucessfull."/>);
                                setLoading(false);
                            })
                        }else{
                            toast(<NotificationError text="Wager must be 0.5algo and above."/>);
                        }
                        
                    }}
                    variant='dark'
                    className="rounded-pill px-0"
                    style={{ margin: "0 auto", width: "10%"}}>
                        Enter
            </Button>
            </div>
        </div>    
    );
};

Acceptchallenge.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired,
};

export default Acceptchallenge;