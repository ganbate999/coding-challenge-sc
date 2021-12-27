//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./DefiAvgPrice.sol";

/// DeFiAvgPrice Version 1
/// @dev The price for a day can be set on the same day
contract DeFiAvgPriceV3 is DeFiAvgPrice {

    using SafeMath for uint256;

    /// Record Timestamp
    /// @param _timestamp target timestamp
    /// @dev set timestamp 00:00:00 (GMT) about all timestamp of same day
    function getRecordTimestamp(uint256 _timestamp) internal pure override returns (uint256) {
        return _timestamp.div(86400).mul(86400);
    }

    function setTokenPrice(address _tokenAddress, uint256 _timestamp, uint256 _price) external onlyOwner {
       setPrice(_tokenAddress, _timestamp, _price);
    }

    /// Set token price
    /// @param _tokenAddress Token Address
    /// @param _timestamp GMT Timestamp  ex: 1609459200 -> 2021/1/1 0:0:0 (GMT)
    /// @param _price Token Price
    function setPrice(address _tokenAddress, uint256 _timestamp, uint256 _price) internal override whenNotPaused {
        require( _tokenAddress != address(0), "token address must not be zero" );
        require( _timestamp > 0, "timestamp must be positive" );
        require( block.timestamp >=_timestamp, "future timestamp" );

        uint256 timestamp = getRecordTimestamp(_timestamp);

        /// Enable same timestamp
        require( lastTimeStamp <= timestamp, "past timestamp" );
        
        if(lastTimeStamp == timestamp){
            getTokenDailyPrice[_tokenAddress][timestamp].price = _price;
            getTokenDailyPrice[_tokenAddress][timestamp].totalPrice = getTokenDailyPrice[_tokenAddress][lastTimeStamp].totalPrice.add(_price);
        } else {
            tokenPriceIndex = tokenPriceIndex.add(1);

            getTokenDailyPrice[_tokenAddress][timestamp].price = _price;
            getTokenDailyPrice[_tokenAddress][timestamp].pastTimeStamp = lastTimeStamp;
            getTokenDailyPrice[_tokenAddress][timestamp].totalPrice = getTokenDailyPrice[_tokenAddress][lastTimeStamp].totalPrice.add(_price);
            getTokenDailyPrice[_tokenAddress][timestamp].totalCounter = tokenPriceIndex;

            lastTimeStamp = timestamp;
        }

        emit SetPrice(_msgSender(), _tokenAddress, timestamp, _price);
    }
}