//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title 多签钱包
 * @author 
 * @notice 
 */
contract MultiSigner{

    address[] public owners;
    uint public required;
    uint public transactionCount;

    struct Transaction{
        address payable addr;
        uint amount;
        bytes data;
        bool executed;
    }

    mapping(uint=>Transaction) public transactions;
    mapping(uint=>mapping(address=>bool))public confirmations;

    constructor(address[] memory _addr,uint _required){
        require(_addr.length>0);
        require(_required>0);
        require(_addr.length>=_required);
        owners=_addr;
        required=_required;
    }

    receive() external payable{}

    /**
     * 提交交易(外部函数)
     * @param _addr 交易地址
     * @param _value 交易金额
     * @param _data 交易数据
     */
    function submitTransaction(address payable _addr,uint _value,bytes memory _data)external{
        uint id=addTransaction(_addr, _value, _data);
        confirmTransaction(id);
    }

    /**
     * 新增交易
     * @param _addr 交易地址
     * @param _value 交易金额
     * @param _data 交易数据
     */
    function addTransaction(address payable _addr,uint _value,bytes memory _data)internal returns(uint){
        transactions[transactionCount]=Transaction(_addr,_value,_data,false);
        return transactionCount++;
    }

    /**
     * 完成交易
     * @param id 交易id
     */
    function confirmTransaction(uint id)public{
        require(isOwner(msg.sender));
        confirmations[id][msg.sender]=true;
        if(isConfirmed(id)){
            executeTransaction(id);
        }
    }

    /**
     * 执行交易
     * @param id 交易id
     */
    function executeTransaction(uint id)public {
        require(isConfirmed(id));
        Transaction storage _tx=transactions[id];
        (bool succ,)=_tx.addr.call{value:_tx.amount}(_tx.data);
        require(succ);
        _tx.executed=true;
    }
    /**
     * 获取交易id对应的已确认地址的个数
     * @param id 交易id
     */
    function getConfirmationsCount(uint id)public view  returns(uint x){
        for(uint i=0;i<owners.length;i++){
            if(confirmations[id][owners[i]]==true){
                x++;
            }
        }
    }

    /**
     * 判断交易id对应的交易是否已满足完成条件
     * @param id 交易id
     */
    function isConfirmed(uint id)public view returns(bool){
        return getConfirmationsCount(id)>=required;
    }

    /**
     * 判断地址是否在所有地址中
     * @param addr 地址
     */
    function isOwner(address addr)private view returns(bool flag){
        for(uint i=0;i<owners.length;i++){
            if(addr==owners[i]){
                flag=true;
            }
        }
    }




}