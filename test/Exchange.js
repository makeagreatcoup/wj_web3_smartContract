const { expect } = require('chai')
const { ethers } = require('hardhat')

require('chai').use(require('chai-as-promised')).should()

let Token
let token
let Exchange
let exchange
let owner
let addr1
let addr2
let addrs
let EtherAdress=ethers.constants.AddressZero;
let feePercent = 10

const parseEther = (n) => {
  return ethers.utils.parseEther(n)
}
describe('Exchange deployment', () => {
  it('deployment', async () => {
    Exchange = await ethers.getContractFactory('Exchange')
    Token = await ethers.getContractFactory('Token');
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    console.log('owner:' + (await owner.getAddress()))
    console.log('addr1:' + addr1.address)
    console.log('addr2:' + addr2.address)
    exchange = await Exchange.deploy(owner.address, feePercent)
    token = await Token.deploy()
  })
})

describe('Exchange Transactions', async () => {
  let result
  it('验证收费地址', async () => {
    result = await exchange.feeAccount()
    result.toString().should.equal(owner.address)
  })
  it('验证手续费百分比', async () => {
    result = await exchange.feePercent()
    result.toString().should.equal(feePercent.toString())
  })
})
describe('Exchange deposit', async () => {
  let result
  let amount
  it('批准代币交易', async () => {
    amount = parseEther('1')
    await token.approve(exchange.address, amount, { from: owner.address })
  })
  it('存入代币', async () => {
    result = await exchange.depositToken(token.address, amount, {
      from: owner.address,
    })
  })
})
// describe('Exchange deposit2', async () => {
//   let result
//   let amount
//   // it('批准代币交易', async () => {
//   //     amount=parseEther('1')
//   //     await token.approve(exchange.address,amount,{from :owner.address})
//   // })
//   it('没有批准代币存入代币', async () => {
//       amount=parseEther('1')
//       await expect(
//         exchange.depositToken(token.address,amount,{from:owner.address})
//       ).to.be.revertedWith("没有批准代币不允许存入");
//   })
// })
describe('Exchange withdraw', async () => {
  let result
  let amount
  it('批准存入代币交易', async () => {
    amount = parseEther('1')
    await token.approve(exchange.address, amount, { from: owner.address })
    await exchange.depositToken(token.address, amount, { from: owner.address })
  })
  it('提取代币', async () => {
    result = await exchange.withdrawToken(token.address, amount, {
      from: owner.address,
    })
  })
})
describe('Exchange order', async () => {
  let result
  let amount
  let count
  it('新增订单', async () => {
    result=await exchange.makeOrder(token.address,parseEther('1'),EtherAdress,parseEther('1'),{from:owner.address})
  })
  
  it('获取订单总量是否为1', async () => {
    count=await exchange.orderCount();
    count.toString().should.equal('1')
  })
  it('取消订单', async () => {
    result=await exchange.cancelOrder('1',{from:owner.address})
    // result.toString().should.equal(true)
  })
  it('查看取消的订单是否为true', async () => {
    result=await exchange.orderCancelled('1');
    result.toString().should.equal('true')
  })
  it('创建订单', async () => {
    result= await exchange.makeOrder(token.address, parseEther('100'), EtherAdress, parseEther('0.1'), {from: owner.address});
    console.log(await exchange.balanceOf(token.address,owner.address))
  })
  
})