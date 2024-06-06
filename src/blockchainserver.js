const express = require('express');
const { Blockchain, Transaction } = require('./blockchain');
const app = express();
const PORT = 3000;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Start to listen at the app port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.json());

const tbbChain = new Blockchain();

const walletLoadStatus = {};

app.post('/loadWallet', (req, res) => {
  const myWalletAddress = req.body.myWalletAddress;
    
  // Load it once
  if (!walletLoadStatus[myWalletAddress]) {
    tbbChain.minePendingTransactions(myWalletAddress); walletLoadStatus[myWalletAddress] = true;
  }
});

// API to create a new transaction
app.post('/createTransaction', (req, res) => {
  const data = req.body;
  const myEncryptedKey = ec.keyFromPrivate(data.myKey);

  // TODO: Validate all data

  // Load it once
  if (!walletLoadStatus[data.myWalletAddress]) {
    tbbChain.minePendingTransactions(data.myWalletAddress); walletLoadStatus[data.myWalletAddress] = true;
  }
  
  console.log(`Creating a txn from ${data.myWalletAddress} to ${data.receiverWalletAddress} for ${data.amount}`);

  // create a txn and sign it
  const txn = new Transaction(data.myWalletAddress, data.receiverWalletAddress, data.amount);
  txn.sign(myEncryptedKey);

  // catch errors whie adding the txn to the blockchain
  try {
    tbbChain.addTransaction(txn);
  } catch (err) {
    console.log('Failed to add transaction');
    res.status(500).send({ message: 'Not enough balance' });
  }
  console.log('Transaction created and added to blockchain');

  // mine the block
  console.log('Mine the block');
  tbbChain.minePendingTransactions(data.myWalletAddress);
  
  res.status(200).send({ message: 'Transaction created successfully' });
});

app.get('/getChain', (req, res) => {
  res.status(200).send(tbbChain.chain);
});

app.get('/getPublicKey', (req, res) => {
  const pvtKey = req.body.pvtKey;
  res.status(200).send({ publicKey: ec.keyFromPrivate(pvtKey).getPublic('hex') });
});

app.get('/getBalance', (req, res) => {
  const myWalletAddress = req.body.myWalletAddress;
  res.status(200).send({ balance: tbbChain.getBalanceOfAddress(myWalletAddress) });
});

app.get('/viewWalletTransactions', (req, res) => {
  const myWalletAddress = req.body.myWalletAddress;
  res.status(200).send({ transactions: tbbChain.getAllTransactionsForWallet(myWalletAddress) });
});
