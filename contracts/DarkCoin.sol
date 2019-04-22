pragma solidity ^0.5.0;

import 'zos-lib/contracts/Initializable.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20.sol';

contract DarkCoin is Initializable, ERC20 {

  uint256 private maxSupply;
  uint256 public currentPrice;


  function initialize() public initializer {
    maxSupply = 666;
    currentPrice = 1000;
  }

  function buy() public payable returns(bool) {
    require(msg.value >= currentPrice);
    require(totalSupply() < maxSupply);
    _mint(msg.sender, 1);
    currentPrice += 100;
    // if user sends too much
    if(msg.value > currentPrice) {
      msg.sender.transfer(msg.value.sub(currentPrice));
    }
    // all went well
    return(true);
  }
}
