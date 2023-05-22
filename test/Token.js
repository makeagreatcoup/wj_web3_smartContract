const { expect } = require('chai')
const { ethers } = require('hardhat')

let Token
let token
let owner
let addr1
let addr2
let addrs

const parseEther = (n) => {
  return ethers.utils.parseEther(n)
}
describe('Token deployment', () => {
  it('deployment', async () => {
    Token = await ethers.getContractFactory('Token')
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    console.log(await owner.getAddress())
    console.log(await addr1.getAddress())
    console.log('owner:' + (await owner.getAddress()))
    console.log('owner:' + addr1.address)
    console.log('owner:' + addr2.address)
    token = await Token.deploy()
  })
})

describe('Token Transactions', async () => {
  let balanceOf
  let result
  it('发送前', async () => {
    balanceOf = await token.balanceOf(owner.address)
    console.log('发送方开始：', owner.address + ':' + balanceOf)
    balanceOf = await token.balanceOf(addr1.address)
    console.log('接收方开始：', addr1.address + ':' + balanceOf)
    result = await token.transfer(addr1.address, parseEther('0.001'), {
      from: owner.address,
    })
  })

  it('发送后', async () => {
    balanceOf = await token.balanceOf(owner.address)
    console.log('发送方结束：', owner.address + ':' + balanceOf)
    balanceOf = await token.balanceOf(addr1.address)
    console.log('接收方结束：', addr1.address + ':' + balanceOf)
  })

  it('调用事件', async () => {
    let log = result
    expect(result.from.toString()).to.equal(owner.address)
    // expect(result.to.toString()).to.equal(addr1.address);
  })
})
// describe("失败调用",async()=>{
//     it('失败调用事件测试', async () => {
//         let invalAmount = parseEther('1');
//         await token.transfer(addr1.getAddress(),invalAmount,{from : owner.getAddress()});
//         // invalAmount = parseEther('10');
//         // await expect(token.transfer(owner.getAddress(),invalAmount,{from : addr1.getAddress()})).to.be.revertedWith("参数错误");
//       })
// })

describe('批准代币交易', async () => {

})
