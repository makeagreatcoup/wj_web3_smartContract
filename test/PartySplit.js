const {assert} = require('chai');
const { ethers } = require('hardhat')
const {parseEther} = ethers.utils;

describe('party split',()=>{
    let friends,manager,constract,initialAmount;
    let previousBalances=[];
    beforeEach(async()=>{
        const signers=await ethers.getSigners();
        friends=signers.slice(1,5);
        manager=signers[6];

        const PartySplit=await ethers.getContractFactory('PartySplit');
        constract=await PartySplit.deploy(parseEther("2"));

        for(let i=0;i<friends.length;i++){
            await constract.connect(friends[i]).rsvp({value:parseEther("2")})
            previousBalances[i]=await ethers.provider.getBalance(friends[i].address);
        }
        initialAmount=await ethers.provider.getBalance(manager.address);

    })

    describe('8 ether',async()=>{
        const bill = parseEther("8");
        beforeEach(async()=>{
            await constract.payBill(manager.address,bill);

        })

        it('应该支付的币',async()=>{
            const balance=await ethers.provider.getBalance(manager.address);
            console.log("--------------------")
            console.log(balance)
            assert.equal(balance.toString(),initialAmount.add(bill));
        })
        it('每人剩余的币', async () => {
            for (let i = 0; i < 4; i++) {
                const balance = await ethers.provider.getBalance(friends[i].address);
                assert.equal(balance.toString(), previousBalances[i].toString());
            }
        });

    })
    describe('4 ether',async()=>{
        const bill = parseEther("4");
        beforeEach(async()=>{
            await constract.payBill(manager.address,bill);

        })

        it('应该支付的币',async()=>{
            const balance=await ethers.provider.getBalance(manager.address);
            assert.equal(balance.toString(),initialAmount.add(bill));
        })
        it('每人应支付的1 eher 币',async()=>{
            for(let i=0;i<friends.length;i++){
                const balance=await ethers.provider.getBalance(friends[i].address);
                const expected=previousBalances
                [i].add(parseEther("1")).toString();
                assert.equal(balance.toString(),expected);
            }
        })

    })

    describe('2 ether',async()=>{
        const bill = parseEther("2");
        beforeEach(async()=>{
            await constract.payBill(manager.address,bill);

        })

        it('应该支付的币',async()=>{
            const balance=await ethers.provider.getBalance(manager.address);
            assert.equal(balance.toString(),initialAmount.add(bill));
        })
        it('每人应支付的0.5 eher 币',async()=>{
            for(let i=0;i<friends.length;i++){
                const balance=await ethers.provider.getBalance(friends[i].address);
                const expected=previousBalances
                [i].add(parseEther("1.5")).toString();
                assert.equal(balance.toString(),expected);
            }
        })

    })
})