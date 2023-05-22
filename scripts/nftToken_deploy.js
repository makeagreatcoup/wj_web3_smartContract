
const hre = require("hardhat");

const main = async () => {
  
  const NftToken = await ethers.getContractFactory("NftToken");

  const nft=await NftToken.deploy();
  await nft.deployed();


  console.log("nft已部署：",nft.address);
  const signer=await hre.provider.getSigner(0);

  await nft.safeMint(await signer.getAddress(),"ipfs://QmXRPtPqnyepJ5ttBz1ppVcE5oipU4kyMQuQD4A7HG1kGm");

  console.log("nft已铸造！");

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
