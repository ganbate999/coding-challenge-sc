//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./DefiAvgPrice.sol";

/// DeFiAvgPrice Version 1
/// @dev Anyone set price
contract DeFiAvgPriceV1 is DeFiAvgPrice {

    function setTokenPrice(address _tokenAddress, uint256 _timestamp, uint256 _price) external {
       setPrice(_tokenAddress, _timestamp, _price);
    }
}