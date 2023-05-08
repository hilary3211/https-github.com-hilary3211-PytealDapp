import React from "react";
import {Spinner} from "react-bootstrap";

const Loader = () => (
    <div className="flex-column text-center min-vh-100">
        <Spinner animation="border" role="status" className="opacity-25">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
);

export default Loader;