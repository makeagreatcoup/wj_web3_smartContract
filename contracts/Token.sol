//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * ERC20标准令牌
 */
contract Token{

    using SafeMath for uint;

    string public name ;
    string public symbol;
    uint256 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(){
        name="Wuji";
        symbol="wuji";
        decimals=18;
        totalSupply=1000000 * (10**decimals);
        balanceOf[msg.sender]=totalSupply;
    }
    
    //代币转账
    function transfer(address _to,uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender]>=_value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    //记录发送方和接收方的转账，自用函数
    function _transfer(address _from, address _to ,uint256 _value) internal{
        require(_to != address(0));
        balanceOf[_from]=balanceOf[_from].sub(_value);
        balanceOf[_to]=balanceOf[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }

    //代币授权，记录被授权方spender支配授权方msg.sender的value数量的代币
    //建立委托关系，添加需要发送token的人和实际转账人之间的关系
    function approve(address _spender,uint256 _value)public returns(bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //授权转账，被授权方将授权方from的value数量的代币转账给to
    //执行这个方法前必须先执行approve建立委托关联数据
    function transferFrom(address _from, address _to ,uint256 _value) external returns(bool success){
        require(balanceOf[_from]>=_value,"no enough balance");
        require(allowance[_from][msg.sender]>=_value,"no enough allowance");
        allowance[_from][msg.sender]=allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }
}