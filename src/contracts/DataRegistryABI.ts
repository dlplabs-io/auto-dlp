export const DATA_REGISTRY_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "url",
                "type": "string"
            }
        ],
        "name": "addFile",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "key",
                "type": "string"
            }
        ],
        "name": "addFilePermission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "bytes",
                        "name": "signature",
                        "type": "bytes"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "score",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "dlpId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "metadata",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "proofUrl",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "instruction",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct IDataRegistry.ProofData",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct IDataRegistry.Proof",
                "name": "proof",
                "type": "tuple"
            }
        ],
        "name": "addProof",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
