//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Token.sol";

//交易所
contract Exchange {
    using SafeMath for uint256;

    address public feeAccount; //收取手续费的地址
    uint256 public feePercent; //手续费百分比
    address constant ETHER = address(0); //存放ether在空地址
    uint256 public orderCount; //订单个数

    mapping(address => mapping(address => uint256)) tokens;
    mapping(uint256 => _Order) orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    event Order(
        uint256 id,
        address user,
        address from,               //接收者的地址
        uint256 fromAmount,
        address to,              //发送者的地址
        uint256 toAmount,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address from,
        uint256 fromAmount,
        address to,
        uint256 toAmount,
        uint256 timestamp
    );
    //交易事件
    event Trade(
        uint256 id,
        address user,
        address from,
        uint256 fromAmount,
        address to,
        uint256 toAmount,
        address userFill,
        uint256 timestamp
    );

    struct _Order {
        uint256 id;
        address user; //订单发起人
        address from; //购买代币地址
        uint256 fromAmount;
        address to; //代币在交易所的地址
        uint256 toAmount;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //eth存入以太坊
    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    //从以太坊提取eth
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    //存入令牌
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        //合约调用者传入金额到当前合约交易所
        require(Token(_token).transferFrom(msg.sender, address(this), _amount),"deposit token transfer failed");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //取出令牌
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount),"withdraw token transfer failed");
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //获取用户在交易所的代币
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //创建订单
    function makeOrder(
        address _from,
        uint256 _fromAmount,
        address _to,
        uint256 _toAmount
    ) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _from,
            _fromAmount,
            _to,
            _toAmount,
            block.timestamp
        );
        emit Order(orderCount,msg.sender,_from,_fromAmount,_to,_toAmount,block.timestamp);
    }

    //取消订单
    function cancelOrder(uint256 _id) public returns (bool success) {
        //从存储器中获取订单信息
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender);
        require(_order.id == _id);
        orderCancelled[_id] = true;
        emit Cancel(
            _order.id,
            msg.sender,
            _order.from,
            _order.fromAmount,
            _order.to,
            _order.toAmount,
            block.timestamp
        );
        return true;
    }

    //填充订单
    function fillOrder(uint256 _id) public {
        require(_id>0&&_id<=orderCount);
        require(!orderFilled[_id]);
        require(!orderCancelled[_id]);
        //从存储器中获取订单信息
        _Order storage _order = orders[_id];
        _trade(
            _order.id,
            _order.user,
            _order.from,
            _order.fromAmount,
            _order.to,
            _order.toAmount
        );
    }

    //交易逻辑
    function _trade(
        uint256 _orderId,
        address _user,
        address _from,
        uint256 _fromAmount,
        address _to,
        uint256 _toAmount
    ) internal {
        //手续费
        uint256 _feeAmount = _toAmount.mul(feePercent).div(100);

        tokens[_from][msg.sender] = tokens[_from][msg.sender].sub(
            _fromAmount.add(_feeAmount)
        );
        tokens[_from][_user] = tokens[_from][_user].add(_fromAmount);
        tokens[_from][feeAccount] = tokens[_from][feeAccount].add(
            _feeAmount
        );
        tokens[_to][_user] = tokens[_to][_user].sub(_toAmount);
        tokens[_to][msg.sender] = tokens[_to][msg.sender].add(
            _toAmount
        );

        emit Trade(
            _orderId,
            _user,
            _from,
            _fromAmount,
            _to,
            _toAmount,
            msg.sender,
            block.timestamp
        );
    }
}
