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
$ yarn hardhat compile
```

### Typechain
```console
$ yarn hardhat typechain
```

### Test
```console
$ yarn hardhat test
```

### Deploying contracts to localhost Hardhat EVM
#### localhost-1
```console
// on terminal-1
$ yarn hardhat node

// on terminal-2
$ yarn hardhat deploy:defiavgpriceV1 --network localhost1

$ yarn hardhat deploy:defiavgpriceV2 --network localhost1 --proxy <Proxy Address>

$ yarn hardhat deploy:defiavgpriceV3 --network localhost1 --proxy <Proxy Address>
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
Token deployed to: 0xFD6F7A6a5c21A3f503EBaE7a473639974379c351
Price: 1000 Time: 1609459200 Set by owner
Price: 2000 Time: 1609462800 Set by addr1
Price: 3000 Time: 1609466400 Set by addr2
Avg Price: 2000 Time: 1609459200 ~ 1609466400 iner set time range
'No Price' will be reverted => time range before 2021/1/1 00:00:00 (GMT)
Reverted: "no price" Time: 1609459200 ~ 1609466400 before set time range
'No Price' will be reverted => time range after 2021/1/1 02:00:00 (GMT)
Reverted: "no price" Time: 1609466500 ~ 1609466600 after set time range
Price: 1000 Time: 1609459200 2021/1/1 00:00:00 (GMT)
Price: 2000 Time: 1609466400 2021/1/1 01:30:00 (GMT)
Price: 3000 Time: 1609466400 2021/1/1 02:00:00 (GMT)
Price: 3000 Time: 1609466500 after set time range
'No Price' will be reverted => time range before 2021/1/1 00:00:00 (GMT)
Reverted: "no price" Time: 1609459100 before set time range
    √ Version 1/Anyone set price (425216 gas)
Token deployed to: 0x0ed64d01D0B4B655E410EF1441dD677B695639E7
Price: 1000 Time: 1609459200 Set by addr1 on Version 1
AvgPriceContract Upgraded V1 => V2 : 0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE
Read data set on V1 : expected: 1000
Price: 1000 Time: 1609459200 Read data successfully (kept data when upgrading)
Set Token Price by addr1 : expected => reverted with "Ownable: caller is not the owner"
setTokenPrice :  Reverted With Error 'Ownable: caller is not the owner'
Price: 2000 Time: 1609462800 Set by owner on Version 2
Price: 3000 Time: 1609466400 Set by owner on Version 2
getAvgPrice between 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Expected Average Price == 2000
Avg Price: 2000 Time: 1609430500 ~ 1609466400 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT)
    √ Version 2/Only owner set price (468510 gas)
Token deployed to: 0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c
AvgPriceContract Upgraded V2 => V3 : 0xefc1aB2475ACb7E60499Efb171D173be19928a05
Set Token Price Time: 2021/1/1 00:00:00 (GMT) => 1000
Price: 1000 Time: 1609459200 Set by owner on Version 3
Set Token Price Time: 2021/1/1 01:00:00 (GMT) => 2000
Price: 2000 Time: 1609462800 Set by owner on Version 3
Get Token Price Time: 2021/1/1 00:00:00 (GMT) => Expected: 2000
Price: 2000 Time: 1609459200
Get Token Price Time: 2021/1/1 02:00:00 (GMT) => Expected: 2000
Price: 2000 Time: 1609466400
Get Token Price Time: 2021/1/1 03:00:00 (GMT) => Expected: 2000
Price: 2000 Time: 1609470000
'No Price' will be reverted => time range before 2020/12/31 00:00:00 (GMT)
Reverted: "no price" Time: 1609372800 before set time range
    √ Version 3/ The price for a day can be set on the same day (243553 gas)

