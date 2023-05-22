
const { ethers } = require('hardhat')

const main = async () => {
  
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory('Exchange');

  const token=await Token.deploy();
  await token.deployed();
  console.log("WJ代币已部署：",token.address);

  const [owner,...addrs] = await ethers.getSigners();
  

  let feePercent = 10

  const exchange = await Exchange.deploy(owner.address,feePercent);
  await exchange.deployed();
  console.log("交易所已部署：",exchange.address);

}

const runMain = async () =>{
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
runMain();
