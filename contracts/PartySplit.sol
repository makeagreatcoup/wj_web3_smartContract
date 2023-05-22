//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * 平分游戏
 */
contract PartySplit{

    uint public amount;
    address[] addrs;
    mapping(address=>bool) isSave;

    constructor(uint _amount){
        amount=_amount;
    }

    //支付后加入游戏
    function rsvp()external payable{
        require(!isSave[msg.sender]);
        require(amount==msg.value);
        addrs.push(msg.sender);
        isSave[msg.sender]=true;
    }

    //平分余额
    function payBill(address addr,uint amt)external{
        (bool succ,)=addr.call{value:amt}("");
        require(succ);
        uint money=address(this).balance/addrs.length;
        for(uint i=0;i<addrs.length;i++){
            (bool su,)=addrs[i].call{value:money}("");
            require(su);
        }
    }


}