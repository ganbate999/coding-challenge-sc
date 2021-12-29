# DeFi Utils - Token average price
Calculate on-chain average price of tokens on DeFi protocol.

## About
* A keeper pushes a price of token(s).
* Task: Find out the avg price of a token for a given time interval range, without iterating in `loop` (for, while).

## Installation
```console
$ yarn install
```

## Usage

### Build
```console
$ yarn compile
```

### Typechain
```console
$ yarn typechain
```

### Test
```console
$ yarn test
```

### Deploying contracts to localhost Hardhat EVM
#### localhost-1
```console
// on terminal-1
$ yarn hardhat node

// on terminal-2
$ yarn hardhat deploy:defiavgpriceV1 --network development

$ yarn hardhat deploy:defiavgpriceV2 --network development --proxy <Proxy Address>

$ yarn hardhat deploy:defiavgpriceV3 --network development --proxy <Proxy Address>
```


### Deploying contracts to Testnet (Public)
#### ETH Testnet - Rinkeby
* Environment variables
	- Create a `.env` file with its values:
```
INFURA_API_KEY=[YOUR_INFURA_API_KEY_HERE]
DEPLOYER_PRIVATE_KEY=[YOUR_DEPLOYER_PRIVATE_KEY_without_0x]
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
DEPLOYER_PRIVATE_KEY=[YOUR_DEPLOYER_PRIVATE_KEY_without_0x]
REPORT_GAS=<true_or_false>
```

* Deploy the token on one-chain
```console
$ yarn hardhat deploy:defiavgpriceV1 --network mainnet

$ yarn hardhat deploy:defiavgpriceV2 --network mainnet --proxy <Proxy Address>

$ yarn hardhat deploy:defiavgpriceV3 --network mainnet --proxy <Proxy Address>
```


### Test Result on hardhat local


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
