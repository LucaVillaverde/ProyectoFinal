import React, {useState} from "react";
// import ReactDom from "react-dom";
import { Confirm } from "../components/Message/Message";

const useConfirm = ()=>{
    const [showIt, setShowIt] = useState(false);
    const [message, setMessage] = useState('');
    const [resolvePromise, setResolvePromise] = useState(null);

    const openConfirm = (msg) =>{
        setMessage(msg);
        setShowIt(true);
        return new promise ((resolve)=>{
            setResolvePromise(()=>resolve)
        });
    };

    const hadleConfirm = ()=>{
        if(resolvePromise) resolvePromise(true);
        closeConfirm();
    }

    const handleCancel = ()=>{
        if(resolvePromise) resolvePromise(false);
        closeConfirm();
    }

    const closeConfirm = ()=>{
        setShowIt(false);
        setMessage('');
        setResolvePromise(null);
    }

    const ConfirmComponent = showIt ? (
        <Confirm
            message={msg}
            onConfirm={hadleConfirm}
            onCancel={handleCancel}
        />
    ):null;

    return { openConfirm, ConfirmComponent}

};

export default useConfirm;