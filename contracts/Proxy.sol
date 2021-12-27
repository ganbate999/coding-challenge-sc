//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Storage.sol";

/// Proxy for Upgradable DeFiAvgPrice
contract Proxy is Storage {

  address public currentAddress;

  /// construct with initial version
  constructor(address _currentAddress) {
    currentAddress = _currentAddress;
  }

  /// Upgrade of new version
  function upgrade(address _newAddress) public onlyOwner {
    require(currentAddress != _newAddress);
    currentAddress = _newAddress;
  }

  /// fallback function for upgradable contract
  fallback() payable external {
    address impl = currentAddress;
    require(impl != address(0));

    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize())
      let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
      let size := returndatasize()
      returndatacopy(ptr, 0, size)
      
      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }
}