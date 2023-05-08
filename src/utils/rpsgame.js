import algosdk from "algosdk";
import {
    algodClient,
    rpsgameNote,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts,
    abi,
    moves,
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "../contracts/approval.teal";
import clearProgram from "../contracts/clear.teal";
import {utf8ToBase64String} from "./conversions";

export let addresses = []
export let Appid = []
export let p1wins = 0
export let p2wins = 0
export let draws = 0
export const addrs = []
export let sum_array = []

const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}


const contract = new algosdk.ABIContract(abi);

export const Deploygame = async(senderAddress,signTransactions) => {
    console.log('Starting a new game ')
    Appid.length = 0
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    let note = new TextEncoder().encode(rpsgameNote);

    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
    });
    const encodedTransaction = algosdk.encodeUnsignedTransaction(txn);
    const signedTransactions = await signTransactions([encodedTransaction]);
    
    const decodedResult = signedTransactions.map(element => {
    return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });

    let txId = txn.txID().toString();

    
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(decodedResult).do();

   
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

   
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    Appid.push(appId)
    console.log("Created new app-id: ", appId);
    return appId;

}


export const Connectgame = async(senderAddress, data, signTransactions) => {
        let params = await algodClient.getTransactionParams().do();
        params.fee = algosdk.ALGORAND_MIN_TX_FEE;
        params.flatFee = true;
        let txn = algosdk.makeApplicationOptInTxnFromObject({
            from : senderAddress,
            suggestedParams : params,
            appIndex : parseInt(data.appid)
        })
        const encodedTransaction = algosdk.encodeUnsignedTransaction(txn);
        const signedTransactions = await signTransactions([encodedTransaction]);
        
        const decodedResult = signedTransactions.map(element => {
        return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
        });

        await algodClient.sendRawTransaction(decodedResult).do();

        let txId = txn.txID().toString();

        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log("Signed transaction with txID: %s", txId);
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        console.log("Connected to game")
        Appid.push(parseInt(data.appid))
        return parseInt(data.appid)
    }


export const create_challenge = async(senderAddress,game,signTxn, appid) => {
    console.log("creating challenge...")
    addresses.length = 0;
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    const atc = new algosdk.AtomicTransactionComposer();

    let appaccount = algosdk.getApplicationAddress(parseInt(appid))

    let txn = algosdk.makeApplicationOptInTxnFromObject({
        from : senderAddress,
        suggestedParams : params,
        appIndex : +appid
    })
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: appaccount,
        amount: game.wager * 1000000,
        suggestedParams: params
    })
    atc.addTransaction({ txn:txn , signer: signTxn } )

    const all = { txn: paymentTxn, signer:signTxn}

    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('create_challenge'),
        methodArgs:[all],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
      })
  
    await atc.execute(algodClient, 4);
    console.log('Challenge made')
}

export const accept_challenge = async(senderAddress,game,signTxn,appid) => {
    console.log("accepting challenge...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    
    let appaccount = algosdk.getApplicationAddress(parseInt(+appid))
    const atc = new algosdk.AtomicTransactionComposer();

    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: appaccount,
        amount: game.wager *1000000,
        suggestedParams: params
    })

    const all = { txn: paymentTxn, signer:signTxn}

    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('accept_challenge'),
        methodArgs:[all],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
      })
  
    await atc.execute(algodClient, 4);
    console.log('Challenge accepted')
}

export const play = async(senderAddress,game,signTxn, appid) => {
    console.log("playing move...")
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    addresses.length = 0
    const atc = new algosdk.AtomicTransactionComposer();
    let play = utf8ToBase64String(moves[game.move])
    
    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('play'),
        methodArgs:[play],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
      })
    
    atc.addMethodCall({
    appID: +appid,
    method: contract.getMethodByName('getplayer1'),
    sender: senderAddress,
    signer: signTxn,
    suggestedParams: params,
    })

    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('getplayer2'),
        methodArgs:[],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
    })
    
  
    const result = await atc.execute(algodClient, 4);

    addresses.push(result['methodResults'][1]['returnValue'], result['methodResults'][2]['returnValue'])
    console.log("Move recorded")
}

export const reveal = async(senderAddress,signTxn,appid) => {
    console.log("Revealing result...")
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    const atc = new algosdk.AtomicTransactionComposer();
    let ingame = []
    let sum = p1wins + p2wins + draws
    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('rw'),
        methodArgs:[addresses[0], addresses[1]],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
    })
    atc.addMethodCall({
        appID: +appid,
        method: contract.getMethodByName('reveal'),
        methodArgs:[addresses[0], addresses[1]],
        sender: senderAddress,
        signer: signTxn,
        suggestedParams: params,
        })
    const result = await atc.execute(algodClient, 4);
    for (const mr of result.methodResults) {
        console.log(`${mr.returnValue}`);
        ingame.push(mr.returnValue)
    }
    
    if (ingame[0] === 0n && sum < 3 ){
        console.log('round ended in a draw')

        draws += 1
    }else if(ingame[0] === 1n && sum < 3 ){
        console.log('Player1 wins this round')
        p1wins += 1
    }else if(ingame[0] === 2n && sum < 3 ){
        console.log('Player2 wins this round')
        p2wins += 1
    }
    sum_array[0] = sum
    //sum_array.push(sum)
    console.log(sum)
}

