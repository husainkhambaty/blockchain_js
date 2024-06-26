/* eslint no-use-before-define: 0 */  

const assert = require('assert');
const { Block } = require('../src/blockchain');
const { createSignedTx } = require('./helpers');

let blockObj = null;

beforeEach(function() {
  blockObj = new Block(1000, [createSignedTx()], 'a1');
});

describe('Block class', function() {
  describe('Constructor', function() {
    it('should correctly save parameters', function() {
      assert.strict.equal(blockObj.previousHash, 'a1');
      assert.strict.equal(blockObj.timestamp, 1000);
      assert.strict.deepEqual(blockObj.transactions, [createSignedTx()]);
      assert.strict.equal(blockObj.nonce, 0);
    });

    it('should correctly save parameters, without giving "previousHash"', function() {
      blockObj = new Block(1000, [createSignedTx()]);
      assert.strict.equal(blockObj.previousHash, '');
      assert.strict.equal(blockObj.timestamp, 1000);
      assert.strict.deepEqual(blockObj.transactions, [createSignedTx()]);
      assert.strict.equal(blockObj.nonce, 0);
    });
  });

  describe('Calculate hash', function() {
    it('should correct calculate the SHA256', function() {
      blockObj.timestamp = 1;
      blockObj.mineBlock(1);

      assert.strict.equal(
        blockObj.hash,
        '07a9bc8d3f536486060dd2909425a45dd0ac3e68468242e2d84daafa8ce75e32'
      );
    });

    it('should change when we tamper with the tx', function() {
      const origHash = blockObj.calculateHash();
      blockObj.timestamp = 100;

      assert.strict.notEqual(
        blockObj.calculateHash(),
        origHash
      );
    });
  });

  describe('has valid transactions', function() {
    it('should return true with all valid tx', function() {
      blockObj.transactions = [
        createSignedTx(),
        createSignedTx(),
        createSignedTx()
      ];

      assert(blockObj.hasValidTransactions());
    });

    it('should return false when a single tx is bad', function() {
      const badTx = createSignedTx();
      badTx.amount = 1337;

      blockObj.transactions = [
        createSignedTx(),
        badTx
      ];

      assert(!blockObj.hasValidTransactions());
    });
  });
});
