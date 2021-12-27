//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Hosokawa
/// @title DeFiAvgPrice Storage
contract Storage is Pausable, Ownable {

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
    uint256 public lastTimeStamp = 0;
    
    /// Index Counter of map
    uint256 public tokenPriceIndex = 0;

}