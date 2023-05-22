const { ethers,artifacts } = require('hardhat')
const { assert } = require('chai')
const EIP20A = artifacts.require("EIP20");

describe('MultiSigner',()=>{
    let contract;
    let accounts;
    beforeEach(async()=>{
        accounts=await ethers.provider.listAccounts();
        const MultiSigner=await ethers.getContractFactory("MultiSigner");
        contract = await MultiSigner.deploy(accounts.slice(0,3),1);
        await contract.deployed();
    })

    describe('存储ERC20 tokens',()=>{
        const initialBalance=10000;
        let token ;

        beforeEach(async()=>{
            const EIP20 =await ethers.getContractFactory(EIP20A.abi, EIP20A.bytecode);
            token=await EIP20.deploy(initialBalance,"my erc20 token",1,"mt");
            await token.deployed();
            await token.transfer(contract.address,initialBalance);
        })

        it('应该存储的余额',async()=>{
            const balance=await token.balanceOf(contract.address);
            assert.equal(balance.toNumber(),initialBalance);
        })
        describe('执行erc20交易',()=>{
            beforeEach(async()=>{
                const data=token.interface.encodeFunctionData("transfer",[accounts[2],initialBalance]);
                await contract.submitTransaction(token.address,0,data);
            })

            it('交易完成后的合约余额',async()=>{
                const balance=await token.balanceOf(contract.address);
                assert.equal(balance.toNumber(),0);
            })

            it('交易完成后的受益人余额',async()=>{
                const balance=await token.balanceOf(accounts[2]);
                assert.equal(balance.toNumber(),initialBalance);
            })
        })
    })
    
    describe('存储ether',()=>{
        const oneEther=ethers.utils.parseEther("1");
        beforeEach(async()=>{
            await ethers.provider.getSigner(0).sendTransaction({to:contract.address,value:oneEther.toString()});
        })

        it('应该存储的余额',async()=>{
            const balance=await ethers.provider.getBalance(contract.address);
            assert.equal(balance.toString(),oneEther.toString());
        })

        describe('执行ether交易',()=>{
            let balanceBefore;
            beforeEach(async()=>{
                balanceBefore=await ethers.provider.getBalance(accounts[1]);
                await contract.submitTransaction(accounts[1],oneEther,"0x");
            })

            it('交易完成后的合约余额',async()=>{
                const balance=await ethers.provider.getBalance(contract.address);
                assert.equal(balance.toNumber(),0);
            })

            it('交易完成后的受益人余额',async()=>{
                const balance=await ethers.provider.getBalance(accounts[1]);
                assert.equal(balance.sub(balanceBefore).toString(),oneEther.toString());
            })
        })
    })
});