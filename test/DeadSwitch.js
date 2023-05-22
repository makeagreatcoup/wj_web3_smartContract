const { ethers } = require('hardhat')
const passTime = (time) => ethers.provider.send('evm_increaseTime', [time])
const oneWeek = 60 * 60 * 24 * 7
const { assert } = require('chai')

describe('Switch',()=>{
    const gasPrice = ethers.utils.parseUnits("1","gwei");
    const oneEther = ethers.utils.parseEther("1");

    let contract;
    let owner,recipient,other;
    let recipientAddr;
    beforeEach(async()=>{
        owner=ethers.provider.getSigner(0);
        recipient=ethers.provider.getSigner(1);
        recipientAddr=await recipient.getAddress();
        other=ethers.provider.getSigner(2);

        const Switch=await ethers.getContractFactory("DeadSwitch");
        contract =await Switch.deploy(recipientAddr,{value:oneEther});
        await contract.deployed();

    })

    it('受益人连接测试',async()=>{
        await assertThrows(contract.connect(recipient).ping(),"交易恢复！受益人不允许连接访问")
    })
    it('其他用户连接测试',async()=>{
        await assertThrows(contract.connect(other).ping(),"交易恢复！其他用户不允许连接访问")
    })
    describe('经过3周不活跃',()=>{
        beforeEach(async()=>{
            await passTime(oneWeek*3);
        })

        it('受益人收款',async()=>{
            await assertBalanceChange(recipientAddr,oneEther,()=>contract.connect(recipient).withdraw({gasPrice}),"受益人收款成功")
        })

    })

    describe('经过1周不活跃',()=>{
        beforeEach(async()=>{
            await passTime(oneWeek*1);
        })

        it('受益人收款',async()=>{
            await assertThrows(contract.connect(recipient).withdraw(),"交易恢复！闲置时间不够长，收款失败")
        })
        describe('经过1.5周不活跃',()=>{
            beforeEach(async()=>{
                await passTime(oneWeek*1.5);
            })
    
            it('受益人收款',async()=>{
                await assertBalanceChange(recipientAddr,oneEther,()=>contract.connect(recipient).withdraw({gasPrice}),"受益人收款成功")
            })
    
        })

        describe('连接之后',()=>{
            beforeEach(async()=>{
                await contract.connect(owner).ping();
            })
    
            describe('经过1周不活跃',()=>{
                beforeEach(async()=>{
                    await passTime(oneWeek*1);
                })
        
                it('受益人收款',async()=>{
                    await assertThrows(contract.connect(recipient).withdraw(),"交易恢复！闲置时间不够长，收款失败")
                })
                describe('经过1.5周不活跃',()=>{
                    beforeEach(async()=>{
                        await passTime(oneWeek*1.5);
                    })
            
                    it('受益人收款',async()=>{
                        await assertBalanceChange(recipientAddr,oneEther,()=>contract.connect(recipient).withdraw({gasPrice}),"受益人收款成功")
                    })
            
                })
            })
    
        })
    })
})

async function assertBalanceChange(address,change,tx,msg){
    const balanceBefore=await ethers.provider.getBalance(address);
    const {gasUsed} = await (await tx()).wait();
    const balanceAfter=await ethers.provider.getBalance(address);
    const gasInWei=ethers.utils.parseUnits(gasUsed.toString(),"gwei");
    assert.equal(
        change.toString(),
        balanceAfter.add(gasInWei).sub(balanceBefore).toString(),
        msg);
}
async function assertThrows(promise,msg){
    let ex;
    try{
        await promise;
    }catch(_ex){
        ex=_ex;
    }
    assert(ex,msg);
}