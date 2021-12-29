//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

/// DeFiAvgPrice base contract
contract DeFiAvgPrice is PausableUpgradeable, OwnableUpgradeable {

    using SafeMath for uint256;

    /// Token Price Structure
    /// @price : Token Price
    /// @totalPrice : Sum of past recorded prices
    /// @totalCounter : Index of map
    /// @pastTimeStamp : Past record`s timestamp of map
    struct TokenPrice {
        uint256 price;
        uint256 totalPrice;
        uint256 totalCounter;
        uint256 pastTimeStamp;
    }

    /// Mapping of token address => timestamp (date) => TokenPrice
    mapping( address => mapping(uint256 => TokenPrice)) public getTokenDailyPrice;

    /// Last TimeStamp of map
    uint256 public lastTimeStamp;
    
    /// Index Counter of map
    uint256 public tokenPriceIndex;

    /// Events
    event SetPrice(address indexed, address indexed, uint256, uint256);

    function initialize() public initializer {
        lastTimeStamp = 0;
        tokenPriceIndex = 0;
        __Ownable_init();
        __Pausable_init();
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /// Return timestamp of map`s record
    function getRecordTimestamp(uint256 _timestamp) internal virtual pure returns (uint256) {
        return _timestamp;
    }

    /// Set token price
    /// @param _tokenAddress Token Address
    /// @param _timestamp GMT Timestamp  ex: 1609459200 -> 2021/1/1 0:0:0 (GMT)
    /// @param _price Token Price
    function setPrice(address _tokenAddress, uint256 _timestamp, uint256 _price) internal virtual whenNotPaused {
        require( _tokenAddress != address(0), "token address must not be zero" );
        require( _timestamp > 0, "timestamp must be positive" );
        require( block.timestamp >=_timestamp, "future timestamp" );

        uint256 timestamp = getRecordTimestamp(_timestamp);

        require( lastTimeStamp < timestamp, "past timestamp" );
        
        tokenPriceIndex = tokenPriceIndex.add(1);

        getTokenDailyPrice[_tokenAddress][timestamp].price = _price;
        getTokenDailyPrice[_tokenAddress][timestamp].pastTimeStamp = lastTimeStamp;
        getTokenDailyPrice[_tokenAddress][timestamp].totalPrice = getTokenDailyPrice[_tokenAddress][lastTimeStamp].totalPrice.add(_price);
        getTokenDailyPrice[_tokenAddress][timestamp].totalCounter = tokenPriceIndex;

        lastTimeStamp = timestamp;

        emit SetPrice(_msgSender(), _tokenAddress, timestamp, _price);
    }

    /// Get target record`s timestamp
    /// @param _tokenAddress Token Address
    /// @param _iterTimestamp timestamp iterator
    /// @param _tpTimestamp target timestamp
    function getDailyTokenPriceTimestamp(address _tokenAddress, uint256 _iterTimestamp, uint256 _tpTimestamp) internal view returns (uint256) {

        uint256 pastDailyTimestamp = getTokenDailyPrice[_tokenAddress][_iterTimestamp].pastTimeStamp;

        if(pastDailyTimestamp == 0) {
            return _iterTimestamp > _tpTimestamp ? 0 : _iterTimestamp;
        }

        if(_iterTimestamp > _tpTimestamp){
            return getDailyTokenPriceTimestamp(_tokenAddress, pastDailyTimestamp, _tpTimestamp);
        }

        return _iterTimestamp;
    }

    /// Get average token price of timestamp range
    /// @param _tokenAddress Token Address
    /// @param _startTimestamp from timestamp
    /// @param _endTimestamp end timestamp
    function getAvgPrice(address _tokenAddress, uint256 _startTimestamp, uint256 _endTimestamp) external view returns (uint256) {
        require( _tokenAddress != address(0), "token address must not be zero" );
        require(_startTimestamp <= _endTimestamp, "start timestamp must be less than end timestamp");

        uint256 startTimestamp = getRecordTimestamp(_startTimestamp);
        uint256 endTimestamp = getRecordTimestamp(_endTimestamp);
        
        
        require(startTimestamp > 1, "invalid start time");

        require(lastTimeStamp >= startTimestamp, "no price");

        uint256 startTotalTimestamp = getDailyTokenPriceTimestamp(_tokenAddress, lastTimeStamp, startTimestamp.sub(1));
        uint256 endTotalTimestamp = getDailyTokenPriceTimestamp(_tokenAddress, lastTimeStamp, endTimestamp);

        require(endTotalTimestamp > 0, "no price");

        uint256 rangeTotalPrice = getTokenDailyPrice[_tokenAddress][endTotalTimestamp].totalPrice.sub(getTokenDailyPrice[_tokenAddress][startTotalTimestamp].totalPrice);
        uint256 count = getTokenDailyPrice[_tokenAddress][endTotalTimestamp].totalCounter.sub(getTokenDailyPrice[_tokenAddress][startTotalTimestamp].totalCounter);

        require(count > 0, "no price");

        return rangeTotalPrice.div(count);
    }

    /// Get token price of special timestamp
    /// @param _tokenAddress Token Address
    /// @param _timestamp from target timestamp
    function getDailyPrice(address _tokenAddress, uint256 _timestamp) external view returns (uint256) {
    
        require( _tokenAddress != address(0), "token address must not be zero" );

        uint256 timestamp = getRecordTimestamp(_timestamp);

        uint256 targetTimestamp = getDailyTokenPriceTimestamp(_tokenAddress, lastTimeStamp, timestamp);

        require(targetTimestamp > 0, "no price");

        return getTokenDailyPrice[_tokenAddress][targetTimestamp].price;
    }

    /// Implemented from PausableUpgradeable    
    /// @notice Pause contract 
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}