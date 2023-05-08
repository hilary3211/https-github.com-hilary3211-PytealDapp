import React, {useState,} from 'react';
import PropTypes from 'prop-types';
import { useWallet } from "@txnlab/use-wallet";
import {Button,Modal} from "react-bootstrap";

export const Cover = ({name, coverImg}) => {
    const {providers} = useWallet();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false)
    return (
        <> 
        <div className="d-flex justify-content-center flex-column text-center bg-black min-vh-100">
            <div className="mt-auto text-light mb-5">
                <div
                    className=" ratio ratio-1x1 mx-auto mb-2"
                    style={{maxWidth: "320px"}}
                >
                    <img src={coverImg} alt=""  />
                </div>
                <h1>{name}</h1>
                <p>Please connect your wallet to continue.</p>
                <Button
                    onClick={() => {
                        setShow(true)
                        }}
                    variant="outline-light"
                    className="rounded-pill px-3 mt-3"
                >
                    Connect Wallet
                </Button>
            </div>
            <p className="mt-auto text-secondary">Powered by Algorand</p>
        </div>


        <Modal show={show} onHide={handleClose} centered className="special_modal">
        <Modal.Header closeButton>
                <Modal.Title>Connect wallet </Modal.Title>
                
            </Modal.Header>
                <Modal.Body>
                <div>
                    {providers?.map((provider) => (
                    
                    <div key={"provider-" + provider.metadata.id}>
                        <div style={{ display:"flex" , justifycontent:"center", alignitem:"center"}}>
                            <Button 
                                    variant="dark"
                                    onClick={() => {
                                    
                                    provider.connect()
                                    .then(() => {
                                        setShow(false)
                                        }
                                    )
                                    }}
                                    disabled={provider.isConnected}
                                    className="rounded-pill"
                                    style={{ margin: "10px auto", width: "55%",}}>
                                    <h4>
                                        <img width={20} height={20} alt="" src={provider.metadata.icon } />
                                        {" " +provider.metadata.name} {provider.isActive && "[active]"}
                                        </h4> 
                            </Button>
                        </div>
                    </div>
                    ))}
                </div>
                </Modal.Body>  
        </Modal>
    </>
    );
};

Cover.propTypes = {
    name: PropTypes.string,
    coverImg: PropTypes.string,
};

export default Cover;