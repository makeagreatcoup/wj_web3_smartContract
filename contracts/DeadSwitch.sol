//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * 亡灵开关:如果有人失去能力，则获得所有资金
 */
contract DeadSwitch{
    uint startTime;
    address startAddr;
    address owner;

    constructor(address addr)payable{
        startAddr=addr;
        owner=msg.sender;
        startTime=block.timestamp;
    }

    function withdraw() external{
        require(block.timestamp-startTime>2 weeks);
        (bool succ,)=startAddr.call{value:address(this).balance}("");
        require(succ);
    }

    function ping() external{
        require(owner==msg.sender);
        startTime=block.timestamp;
    }
}