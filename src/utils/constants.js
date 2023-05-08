import algosdk from "algosdk";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";


const config = {
    algodToken: "",
    algodServer: "https://node.testnet.algoexplorerapi.io/",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://algoindexer.testnet.algoexplorerapi.io/",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);



export const minRound = 25556983;

export const rpsgameNote = "rps-game:uv1"


export const numLocalInts = 0;
export const numLocalBytes = 1;

export const numGlobalInts = 5; 
export const numGlobalBytes = 2;
export const ALGORAND_DECIMALS = 6;
export const Appid = 191909283
export const connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal,
  });


export const abi = {
    "name": "rps",
    "methods": [
      {
        "name": "create_challenge",
        "args": [
          {
            "type": "pay",
            "name": "payment"
          }
        ],
        "returns": {
          "type": "void"
        }
      },
      {
        "name": "accept_challenge",
        "args": [
          {
            "type": "pay",
            "name": "payment"
          }
        ],
        "returns": {
          "type": "void"
        }
      },
      {
        "name": "play",
        "args": [
          {
            "type": "string",
            "name": "play"
          }
        ],
        "returns": {
          "type": "address"
        }
      },
      {
        "name": "getplayer1",
        "args": [],
        "returns": {
          "type": "address"
        }
      },
      {
        "name": "getplayer2",
        "args": [],
        "returns": {
          "type": "address"
        }
      },
      {
        "name": "rw",
        "args": [
          {
            "type": "account",
            "name": "account1"
          },
          {
            "type": "account",
            "name": "account2"
          }
        ],
        "returns": {
          "type": "uint64"
        }
      },
      {
        "name": "reveal",
        "args": [
          {
            "type": "account",
            "name": "account1"
          },
          {
            "type": "account",
            "name": "account2"
          }
        ],
        "returns": {
          "type": "void"
        }
      }
    ],
    "networks": {}
  }

export const moves = {
    'Rock': 'r',
    'R': 'r',
    'r': 'r',
    'rock': 'r',
    'Paper' :'p',
    'P': 'p',
    'p': 'p',
    'paper': 'p',
    'Scissors': 's',
    'S': 's',
    's': 's',
    'scissors': 's',
}