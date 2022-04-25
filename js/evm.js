// contract utility functions for testing
// const Tx = require('ethereumjs-tx').Transaction;  


const DAY_SECONDS = 60 * 60 * 24; // seconds in a day
const DAY_MILLISECONDS = DAY_SECONDS*1000;

// https://michalzalecki.com/ethereum-test-driven-introduction-to-solidity-part-2/
////
// source: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/increaseTime.js
// @param int duration Time in days to increase by 
module.exports.increaseTime = function increaseTime(days) {
  // duration *= DAY_SECONDS;

  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [days*DAY_SECONDS],
        id: id
      },
      err1 => {
        if (err1) return reject(err1);

        web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: id + 1
          },
          async (err2, res) => {
            let block = await web3.eth.getBlock("latest");
            return err2 ? reject(err2) : resolve(block.timestamp); // returns latest timestamp
          }
        );
      }
    );
  });
};

module.exports.decreaseTime = function decreaseTime(days) {

  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_decreaseTime",
        params: [days*DAY_SECONDS],
        id: id
      },
      err1 => {
        if (err1) return reject(err1);

        web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: id + 1
          },
          async (err2, res) => {
            let block = await web3.eth.getBlock("latest");
            return err2 ? reject(err2) : resolve(block.timestamp); // returns latest timestamp
          }
        );
      }
    );
  });
};


module.exports.advanceBlockAtTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [time],
        id: new Date().getTime(),
      },
      (err, _) => {
        if (err) {
          return reject(err);
        }
        const newBlockHash = web3.eth.getBlock("latest").timestamp;

        return resolve(newBlockHash);
      },
    );
  });
};

/**
 * @dev Adds the number of days to a block.timestamp
 *
 * @param _days Number of days to add to a retrieved timestamp
 **/
module.exports.addDaysToTimestamp = function (days, timestamp) {
  timestamp = new Date(Math.floor(timestamp));
  timestamp.setSeconds(timestamp.getSeconds() + (days*DAY_SECONDS));
  // return the real time to seconds since epoch / unix
  timestamp = Math.floor(timestamp.getTime());
  return timestamp;
}

// https://medium.com/fluidity/standing-the-time-of-test-b906fcc374a9

module.exports.advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [time],
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      return resolve(result)
    })
  })
}

module.exports.advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      const newBlockHash = web3.eth.getBlock('latest').hash

      return resolve(newBlockHash)
    })
  })
}

module.exports.takeSnapshot = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_snapshot',
      id: new Date().getTime()
    }, (err, snapshotId) => {
      if (err) { return reject(err) }
      return resolve(snapshotId)
    })
  })
}

module.exports.revertToSnapShot = (id) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_revert',
      params: [id],
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      return resolve(result)
    })
  })
}

// advanceTimeAndBlock = async (time) => {
//   await advanceTime(time)
//   await advanceBlock()
//   return Promise.resolve(web3.eth.getBlock('latest'))
// }

// module.exports = {
//   advanceTime,
//   advanceBlock,
//   advanceTimeAndBlock,
//   takeSnapshot,
//   revertToSnapShot
// }

module.exports.estimateGas = function (acc, contractAddr, data, cb) {
  web3.eth.estimateGas({
      from: acc, 
      data: data,
      to: contractAddr
  }, function(err, estimatedGas) {
    if (err) console.log(err);
    console.log(estimatedGas);
    cb(estimatedGas, err);
  });
}

module.exports.getGasHistory = async function (result) {
  let gasUsed = parseInt(result.receipt.gasUsed);
  const tx = await web3.eth.getTransaction(result.tx);
  let gasPrice = parseInt(tx.gasPrice.toString());
  return [gasUsed, gasPrice];
}

module.exports.getNetwork = function () {
  
// "1": Ethereum Mainnet
// "2": Morden Testnet (deprecated)
// "3": Ropsten Testnet
// "4": Rinkeby Testnet
// "42": Kovan Testnet

//     // The ganache GUI I have running returns "5777".
//     // My embedded testRPC version returns whatever network ID is 
//     // specified in truffle.js config, such as "*"
//     let networkID = (await this.promisify(web3.currentProvider.sendAsync, {
//         jsonrpc: "2.0",
//         method: "net_version",
//         params: [],
//         id: 0
//     })).result;

//     // Both ganache and my embedded testRPC version return "63"
//     let protocolVersion = (await this.promisify(web3.currentProvider.sendAsync, {
//         jsonrpc: "2.0",
//         method: "eth_protocolVersion",
//         params: [],
//         id: 0
//     })).result;

}





async function checkNetworkSettings() {

  const INFURA_DEV = `${process.env.INFURA_DEV}/${process.env.INFURA_ID}`;
  const INFURA_MAIN = `${process.env.INFURA_MAIN}/${process.env.INFURA_ID}`;

  async function _checkNetwork(network) {
    console.log(`checking network: ${network}`)
    try {
      const ethRpc = require('eth-json-rpc')(network);
      let blockNumber = await ethRpc.eth.blockNumber();
      console.log(`block number: ${blockNumber}`); // 7280000
      if (!blockNumber||parseInt(blockNumber)<=0)
        return false;
      return true;
    }
    catch (e) {
      console.error(e)
      return false;
    }
  }

  if (process.env.NODE_ENV=="test"||process.env.NODE_ENV=="development") {
    if (await _checkNetwork(process.env.NETWORK_DEV))
      process.env.NETWORK = process.env.NETWORK_DEV;
    else if (await _checkNetwork(INFURA_DEV)) {
      process.env.NETWORK = INFURA_DEV;
    }
  }
  else if (process.env.NODE_ENV=="staging"||process.env.NODE_ENV=="production") {    
    if (await _checkNetwork(process.env.NETWORK_MAIN))
      process.env.NETWORK = process.env.NETWORK_MAIN;
    else if (await _checkNetwork(INFURA_MAIN))
      process.env.NETWORK = INFURA_MAIN;
  }
}
module.exports.checkNetworkSettings = checkNetworkSettings;
