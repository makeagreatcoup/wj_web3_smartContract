
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

// const PRIVATE_KEY=process.env.PRIVATE_KEY || ''
// const GOERLI_RPC_URL=process.env.GOERLI_RPC_URL||''

const ganache_private_key1 = 'bafcda46a0f6d50ba3b2916f7753b4ce7eee6e59758a0dadef01a8b703627d66'
const ganache_private_key2 = 'b255dd3ef3c82010dd45a6f496488174e5179fd022d57d835cafd30400bb5211'
const ganache_private_key3 = 'dd97baa68b876a1a3337ca8f61265153ccf3259f4de0b59fa8a07da7dcbb96f2'
const ganache_private_key4 = '6ff9a4aa1d168a2b53a26b50459b51198d16c51498171dd79a20bd10da4077d5'
const ganache_private_key5 = 'a10df3177603036493e874e4ab5cb307fa4b5b67ebfd1160de29c33cc8c381e2'


const {PRIVATE_KEY,GOERLI_RPC_URL} = process.env
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat:{
      loggingEnabled:true
    },
    localhost:{
      url:'http://localhost:8545'
    },
    ganache:{
      url:'http://127.0.0.1:8545',
      accounts:[`0x${ganache_private_key1}`,`0x${ganache_private_key2}`,`0x${ganache_private_key3}`,`0x${ganache_private_key4}`,`0x${ganache_private_key5}`]
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  },
  // etherscan:{
  //   apiKey: process.env.ETHERSCAN_API_KEY
  // }
  plugins:[
    "solidity","dotenv"
  ],
  dotenv:{
    path:".env",
    safe:true,
    expandVariables:true
  },
  loggingEnabled:true,
}