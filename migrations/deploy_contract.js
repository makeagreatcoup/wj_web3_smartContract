const Token = await ethers.getContractFactory("Token");
const Exchange = await ethers.getContractFactory('Exchange');

let owner
let addr1
let addr2
let addrs

module.exports=async function(deployer){
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    await deployer.deploy(Token)

    const feeAccount=owner
    const feePercent=10
    await deployer.deploy(Exchange,feeAccount,feePercent)
}