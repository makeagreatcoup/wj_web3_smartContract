const { ethers } = require('hardhat')
const exchangeabi=require('../artifacts/contracts/Exchange.sol/Exchange.json')

const tokenAddress='0x3241524d8A6FAb941327DBc830430D2A7a031Aa8'
const exchangeAddress='0x2C1910ED08f110C18bD8c6C53724208B69c8ed6b'

let Token
let Exchange
let token
let exchange
let signers
let accounts
let owner
let addr1
let addr2
let addrs
let EtherAdress=ethers.constants.AddressZero;

const parseEther = (n) => {
  if(typeof n!=="string"){
    n=n.toString()
  }
  return ethers.utils.parseEther(n).toString()
}

const tokens=(n)=>{
  return parseEther(n)
}

function getRandomInt(min,max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const wait = (seconds) =>{
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
console.log("--------------------------------参数获取完成")
async function main(){
  console.log("--------------------------------任务执行开始")
  Token = await ethers.getContractFactory("Token");
  Exchange = await ethers.getContractFactory('Exchange');
  signers = await ethers.getSigners();
  accounts = await ethers.provider.listAccounts();
  [owner, addr1, addr2, ...addrs] = accounts

  //部署
  let token
  if(tokenAddress){
    token= Token.attach(tokenAddress);
    console.log("WJ代币已接入：",token.address);
  }else{
    token= await Token.deploy();
    await token.deployed();
    console.log("WJ代币已部署：",token.address);
  }
  
  let exchange
  if(exchangeAddress){
    exchange= Exchange.attach(exchangeAddress);
    console.log("交易所已接入：",exchange.address);
  }else{
    let feePercent = 10
    exchange = await Exchange.deploy(owner,feePercent);
    await exchange.deployed();
    console.log("交易所已部署：",exchange.address);
  }
  


  //将用户1的代币转10000给用户2
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = '10000' //10,000 tokens

  await token.transfer(receiver, parseEther(amount), {from: sender})
  console.log(`1号用户转账${amount}个tokens到2号用户`)

  amount='1'
  let addrx
  console.log(`2个用户开始存入ether`)
  for (let index = 0; index < 2; index++) {
    addrx = accounts[index];
    await exchange.connect(signers[index]).depositEther({from:addrx,value:parseEther(amount)})
    console.log(`${index+1}号用户存入${amount}ether `)
}
  

  //10个用户存入1000个代币
  //token授权，exchange存入该用户的代币
  console.log(`2个用户开始用ether买入代币`)
  amount = '1000'
  let gasLimit=ethers.BigNumber.from(1000000)
  for (let index = 0; index < 2; index++) {
      addrx = accounts[index];
      await token.connect(signers[index]).approve(exchange.address,parseEther(amount), { from: addrx })
      await exchange.connect(signers[index]).depositToken(token.address,parseEther(amount), { from: addrx ,gasLimit})
      console.log(`${index+1}号用户:${addrx}入账${amount}个代币`)
  }

  //----------------------------------------------------------
  let result
  let orderId
  let receipt
  console.log(`1号用户创建订单`)
  result = await exchange.makeOrder(token.address, tokens(100), EtherAdress, parseEther(0.1), {from: accounts[0]})

  //获取事件的参数数据
  const getEventArgs =async(result,abi,key)=>{
    await result.wait()
    receipt=await ethers.provider.getTransactionReceipt(result.hash)
    let eventInterface = new ethers.utils.Interface(abi.abi);

    //LogDescription对象
    let event=eventInterface.parseLog(receipt.logs[0])
    return event.args[key];
  }

  //取消订单数据
  orderId=await getEventArgs(result,exchangeabi,'id');
  await exchange.cancelOrder(orderId,{from:accounts[0]})
  console.log(`1号用户取消订单`)
  await wait(1)

//   const cancelStream = exchange.queryFilter("Cancel",0,"latest").then((res)=>{
//     console.log(res)
// })

  //完成订单数据
  const fillOrderFunc=async(i,j,tokenAmount,etherAmount)=>{
    result = await exchange.connect(signers[i]).makeOrder(token.address, tokens(tokenAmount), EtherAdress, parseEther(etherAmount), {from: accounts[i]})
    console.log(`${i+1}号用户${accounts[i]}创建买入订单`)

    orderId = await getEventArgs(result,exchangeabi,'id')
    await exchange.connect(signers[j]).fillOrder(orderId, {from: accounts[j]})
    console.log(`${j+1}号用户${accounts[j]}完成订单`)
    await wait(1)
  }
  await fillOrderFunc(0,1,100,0.1)
  await fillOrderFunc(0,1,50,0.01)
  await fillOrderFunc(0,1,200,0.15)


  const makeOrderBuyFunc=async(i,tokenAmount,etherAmount)=>{
    result = await exchange.connect(signers[i]).makeOrder(token.address, tokens(tokenAmount), EtherAdress, parseEther(etherAmount), {from: accounts[i]})
    console.log(`${i+1}号用户${accounts[i]}创建买入订单`)
    await wait(1)
  }

  const makeOrderSellFunc=async(i,tokenAmount,etherAmount)=>{
    result = await exchange.connect(signers[i]).makeOrder( EtherAdress, parseEther(etherAmount),token.address, tokens(tokenAmount), {from: accounts[i]})
    console.log(`${i+1}号用户${accounts[i]}创建卖出订单`)
    await wait(1)
  }

  //创建未完成订单数据
  for(let i=0;i<5;i++){
    if(i%2==0){
      //最多5次创建买入订单
      let randomNum=getRandomInt(1,5)
      for(let j=0;j<randomNum;j++){
        await makeOrderBuyFunc(i,10*getRandomInt(1,10),0.01*getRandomInt(1,5))
      }
    }else{
      //最多5次创建卖出订单
      let randomNum=getRandomInt(1,5)
      for(let j=0;j<randomNum;j++){
        await makeOrderSellFunc(i,10*getRandomInt(1,10),0.01*getRandomInt(1,5))
      }
    }
  }
  console.log("--------------------------------任务执行结束")
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
// module.exports = async function(callback){
//     console.log("-------------执行任务开始")
//     try{
//         await main()
//     }catch(error){
//         callback(error)
//     }finally{
//       console.log("-------------执行任务结束")
//       callback()
//     }
// }