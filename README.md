# DeFi Utils - Token average price
Calculate on-chain average price of tokens on DeFi protocol.

## About
* Upgradable, pausable token average price smart contract which can be used to calculate the average price of a token (with given address).
* Task:
  
	- Find out the avg price of a token for a given time interval range, without iterating in `loop` (for, while).
	- Have full freedom to decide the data structure of the contract for efficient gas consumption.
	- Follow GMT timestamp as day timezone for precision.

## Features
* Set price for a day.
* View price on a day.
* View average token price from Aug to Sept out of 1 year data (Jan-Dec).

## Versions
- Version-1 :  Anyone can set everyday price of a token.
- Version-2 :  Only Owner can set everyday price of a token.
- Version-3 :  The price of a token on a day can be set on the same day itself.

## Installation
```console
$ yarn install
```

## Usage

### Build
```console
$ yarn compile
```

### TypeChain
```console
$ yarn typechain
```

### Test
```console
$ yarn test
```

### Deploying contracts to localhost Hardhat EVM
#### localhost
```console
// on terminal-1
$ yarn hardhat node

// on terminal-2
$ yarn hardhat deploy:defiavgpriceV1 --network development

$ yarn hardhat deploy:defiavgpriceV2 --network development --proxy <Proxy Address>

$ yarn hardhat deploy:defiavgpriceV3 --network development --proxy <Proxy Address>
```

#### Result
```console
// on terminal-1
$ yarn hardhat node

// on terminal-2
$ yarn hardhat deploy:defiavgpriceV1 --network development
Proxy version1 deployed => address: 0x5c04aF4100B89e8Ca1A39788269980Ed4EF98d9A

$ yarn hardhat deploy:defiavgpriceV2 --network development --proxy 0x5c04aF4100B89e8Ca1A39788269980Ed4EF98d9A
Proxy upgrade to version2 => address: 0x5c04aF4100B89e8Ca1A39788269980Ed4EF98d9A

$ yarn hardhat deploy:defiavgpriceV2 --network development --proxy 0x5c04aF4100B89e8Ca1A39788269980Ed4EF98d9A
Proxy upgrade to version3 => address: 0x5c04aF4100B89e8Ca1A39788269980Ed4EF98d9A
```


### Deploying contracts to Testnet (Public)
#### ETH Testnet - Rinkeby
* Environment variables
	- Create a `.env` file with its values:
```
INFURA_API_KEY=[YOUR_INFURA_API_KEY_HERE]
PRIVATE_KEY=[YOUR_DEPLOYER_PRIVATE_KEY_without_0x]
REPORT_GAS=<true_or_false>
```

* Deploy the contracts
```console
$ yarn hardhat deploy:defiavgpriceV1 --network rinkeby

$ yarn hardhat deploy:defiavgpriceV2 --network rinkeby --proxy <Proxy Address> 

$ yarn hardhat deploy:defiavgpriceV3 --network rinkeby --proxy <Proxy Address>
```

### Deploying contracts to Mainnet
#### ETH Mainnet
* Environment variables
	- Create a `.env` file with its values:
```
INFURA_API_KEY=[YOUR_INFURA_API_KEY_HERE]
PRIVATE_KEY=[YOUR_DEPLOYER_PRIVATE_KEY_without_0x]
REPORT_GAS=<true_or_false>
```

* Deploy the token on one-chain
```console
$ yarn hardhat deploy:defiavgpriceV1 --network mainnet

$ yarn hardhat deploy:defiavgpriceV2 --network mainnet --proxy <Proxy Address>

$ yarn hardhat deploy:defiavgpriceV3 --network mainnet --proxy <Proxy Address>
```


### Test Result
*  DeFiAvgPrice Test ...........
```console
 Ownable
      √ Owner is able to transfer ownership
      √ No Owner is not able to transfer ownership
    Pausable
      √ Owner is able to pause when NOT paused
      √ Owner is able to unpause when already paused
      √ Owner is NOT able to pause when already paused
      √ Owner is NOT able to unpause when already unpaused
    Version 1/Anyone set price
      √ Anyone set price
      √ timestamp must be positive
      √ Past timestamp price can not be set
      √ Future timestamp price can not be set
      √ token address must not be zero
    Version 1/get avg price
      √ get avg price inner set time
      √ start timestamp must be less than end timestamp
      √ no price outsite of set time
    Version 1/get daily price
      √ token address must not be zero
      √ get daily price
      √ no price outside of set time
    Version 2/Only owner set price
      √ owner set price
      √ other can not set price
      √ keep data after upgrading
    Version 3/ The price for a day can be set on the same day
      √ The price for a day can be set on the same day
      √ no price outside of day
```
