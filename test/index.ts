import { expect } from "chai";
import { Contract, ContractFactory } from 'ethers';
import { upgrades, ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const HOUR_TIMESTAMP = 3600;
const DAY_TIMESTAMP = 24 * HOUR_TIMESTAMP;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// Timestamps
const TIME_2020_12_1 = getUtcTimestamp(new Date(2020, 11, 1));
const TIME_2020_12_31 = getUtcTimestamp(new Date(2020, 11, 31));
const TIME_2021_1_1 = getUtcTimestamp(new Date(2021, 0, 1));
const TIME_2021_3_31 = getUtcTimestamp(new Date(2021, 2, 31));
const TIME_2021_4_1 = getUtcTimestamp(new Date(2021, 3, 1));
const TIME_2021_4_30 = getUtcTimestamp(new Date(2021, 3, 30));
const TIME_2021_5_1 = getUtcTimestamp(new Date(2021, 4, 1));
const TIME_2021_5_1_1 = TIME_2021_5_1 + 1 * HOUR_TIMESTAMP;
const TIME_2021_5_1_2 = TIME_2021_5_1 + 2 * HOUR_TIMESTAMP;
const TIME_2021_5_31 = getUtcTimestamp(new Date(2021, 4, 31));
const TIME_2023_1_1 = getUtcTimestamp(new Date(2023, 0, 1));

function getUtcTimestamp(date: Date){
  return Math.floor((date.getTime() + date.getTimezoneOffset() * 60 * 1000)/1000);
}

describe("DeFiAvgPrice Test ...........", function () {

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let testToken: Contract;
  let defiAvgPriceContract: Contract;
  let DefiAvgPriceV1: ContractFactory;
  let DefiAvgPriceV2: ContractFactory;
  let DefiAvgPriceV3: ContractFactory;

  beforeEach(async () => {

    [owner, addr1, addr2] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken", owner);
    testToken = await TestToken.deploy("TDT Token", "TDT", 10000);

    await testToken.deployed();

    //console.log('time', getUtcTimestampNow());
    //console.log("Token deployed to:", testToken.address);

    DefiAvgPriceV1 = await ethers.getContractFactory("DeFiAvgPriceV1", owner);
    defiAvgPriceContract = await upgrades.deployProxy(DefiAvgPriceV1, [], { initializer: 'initialize' });

    // Set price 1000 ~ 1089 (from Jan to March)
    let initTokenPrice = 1000;
    for(let itemIter = TIME_2021_1_1; itemIter <= TIME_2021_3_31; itemIter += DAY_TIMESTAMP){
      await defiAvgPriceContract.setTokenPrice(testToken.address, itemIter, initTokenPrice++);
    }

    DefiAvgPriceV2 = await ethers.getContractFactory("DeFiAvgPriceV2", owner);

    DefiAvgPriceV3 = await ethers.getContractFactory("DeFiAvgPriceV3", owner);
  });

  describe("Ownable", async function() {

    it("Owner is able to transfer ownership", async () => {

      await expect(defiAvgPriceContract.transferOwnership(addr1.address))
        .to.emit(defiAvgPriceContract, 'OwnershipTransferred')

    });


    it("No Owner is not able to transfer ownership", async () => {

      await defiAvgPriceContract.transferOwnership(addr1.address);

      await expect(defiAvgPriceContract.transferOwnership(addr2.address))
        .to.be.revertedWith('Ownable: caller is not the owner')
    });

  });

  describe("Pausable", async function() {

    it("Owner is able to pause when NOT paused", async () => {
			await expect(defiAvgPriceContract.pause())
				.to.emit(defiAvgPriceContract, 'Paused')
				.withArgs(owner.address);
		});


    it("Owner is able to unpause when already paused", async () => {
			defiAvgPriceContract.pause();

			await expect(defiAvgPriceContract.unpause())
				.to.emit(defiAvgPriceContract, 'Unpaused')
				.withArgs(owner.address);
		});

    it("Owner is NOT able to pause when already paused", async () => {
			defiAvgPriceContract.pause();

			await expect(defiAvgPriceContract.pause())
				.to.be.revertedWith("Pausable: paused");
		});

		it("Owner is NOT able to unpause when already unpaused", async () => {
			defiAvgPriceContract.pause();

			defiAvgPriceContract.unpause();

			await expect(defiAvgPriceContract.unpause())
				.to.be.revertedWith("Pausable: not paused");
		});

  });

  describe("Version 1/Anyone set price", async function () {

    it("Anyone set price", async function() {

      /// TIME_DAY_1_HOUR_0 => 1000
      await expect(defiAvgPriceContract.connect(owner).setTokenPrice(testToken.address, TIME_2021_4_1, 1000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 1000 + ' Time: ' + TIME_DAY_1_HOUR_0 + ' Set by owner');

      /// TIME_DAY_1_HOUR_2 => 2000
      await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, TIME_2021_4_30, 2000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 2000 + ' Time: ' + TIME_DAY_1_HOUR_2 + ' Set by addr1');

      /// TIME_DAY_1_HOUR_4 => 3000
      await expect(defiAvgPriceContract.connect(addr2).setTokenPrice(testToken.address, TIME_2021_5_1, 3000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 3000 + ' Time: ' + TIME_DAY_1_HOUR_4 + ' Set by addr2')
    });

    it("timestamp must be positive", async function() {
      await expect(defiAvgPriceContract.setTokenPrice(testToken.address, 0, 1000)).to.be.revertedWith('timestamp must be positive');
    });

    it("Past timestamp price can not be set", async function() {

        await expect(defiAvgPriceContract.setTokenPrice(testToken.address, TIME_2021_1_1, 1000)).to.be.revertedWith('past timestamp');
    });

    it("Future timestamp price can not be set", async function() {

      //console.log('block timestamp', blockTime, future_time);
      await expect(defiAvgPriceContract.setTokenPrice(testToken.address, TIME_2023_1_1, 1000)).to.be.revertedWith('future timestamp');
    });

    it("token address must not be zero", async function() {
      await expect(defiAvgPriceContract.setTokenPrice(ZERO_ADDRESS, TIME_2021_4_1, 1000)).to.revertedWith('token address must not be zero');
    });
  });

  describe("Version 1/get avg price", async function () {

    it("get avg price from Jan to March", async function() {

      // 1000 ~ 1089 (31 + 28 + 31 -1)
      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_1_1, TIME_2021_3_31)).to.eq(1044);

    });

    it("start timestamp must be less than end timestamp", async function() {

      await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_3_31, TIME_2021_1_1)).to.revertedWith('start timestamp must be less than end timestamp');
    });

    it("no price outsite of set time", async function() {

        // before
        await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2020_12_1, TIME_2020_12_31)).to.revertedWith('no price');

        // after
        await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_4_1, TIME_2021_4_30)).to.revertedWith('no price');

    });

  });

  describe("Version 1/get daily price", async function () {

    it("token address must not be zero", async function() {

      await expect(defiAvgPriceContract.getDailyPrice(ZERO_ADDRESS, TIME_2021_1_1)).to.revertedWith('token address must not be zero');
    });


    it("get daily price", async function() {
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_1_1)).to.eq(1000);
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_3_31)).to.eq(1089);
    });


    it("no price outside of set time", async function() {

      await expect(defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2020_12_31)).to.revertedWith('no price');
    });
  });

  describe("Version 2/Only owner set price", async function () {

    beforeEach(async () => {

      // Upgrade to Version 2
      defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV2);
      //   console.log('AvgPriceContract Upgraded V1 => V2 : ' + defiAvgPriceContract.address);
    });

    it("owner set price", async function() {

      await expect(defiAvgPriceContract.connect(owner).setTokenPrice(testToken.address, TIME_2021_4_1, 2000)).to.emit(defiAvgPriceContract, 'SetPrice');
    });


    it("other can not set price", async function() {

      await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, TIME_2021_4_1, 2000)).to.revertedWith('Ownable: caller is not the owner');
    });

    it("keep data after upgrading", async function () {

      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_1_1)).to.eq(1000)
      //console.log('Price: '  + 1000 + ' Time: ' + TIME_DAY_2_HOUR_0 + ' Read data successfully (kept data when upgrading)');
    });


    it("get avg price from Jan to April", async function () {

      // Confirm avg price from Jan to March => 1000 ~ 1089 (31 + 28 + 31 -1)
      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_1_1, TIME_2021_3_31)).to.eq(1044);

      // set data on Version 2 from March to April
      let initTokenPrice = 1090;
      for(let itemIter = TIME_2021_4_1; itemIter <= TIME_2021_4_30; itemIter += DAY_TIMESTAMP){
        await defiAvgPriceContract.setTokenPrice(testToken.address, itemIter, initTokenPrice++);
      }

      // Get avg price from Jan to April 1000 ~ 1119 (31 + 28 + 31 -1)
      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_1_1, TIME_2021_4_30)).to.eq(1059);
    });

  });

  describe("Version 3/ The price for a day can be set on the same day", async function () {

    beforeEach(async () => {

      // set data on Version 2 from March to April (1090 ~ 1119)
      let initTokenPrice = 1090;
      for(let itemIter = TIME_2021_4_1; itemIter <= TIME_2021_4_30; itemIter += DAY_TIMESTAMP){
        await defiAvgPriceContract.setTokenPrice(testToken.address, itemIter, initTokenPrice++);
      }

      // Upgrade to Version 3
      defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV3);
      //   console.log('AvgPriceContract Upgraded V1 => V3 : ' + defiAvgPriceContract.address);

    });

    it('The price for a day can be set on the same day', async () => {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_2021_5_1, 1000);

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_2021_5_1_1, 2000);

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_2021_5_1_2, 3000);

      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_5_1)).to.eq(3000);

      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_5_1_1)).to.eq(3000);

      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_2021_5_1_2)).to.eq(3000);
    })

    it('no price outside of day', async () => {
      // before
      await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2020_12_1, TIME_2020_12_31)).to.revertedWith('no price');
    })

    it('get avg price from Jan to May', async () => {

      // Confirm avg price from Jan to April on version 2 => 1000 ~ 1119 (31 + 28 + 31 -1)
      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_1_1, TIME_2021_4_30)).to.eq(1059);

      // set data of May on Version 3 (1120 ~ 1150)
      let initTokenPrice = 1120;
      for(let itemIter = TIME_2021_5_1; itemIter <= TIME_2021_5_31; itemIter += DAY_TIMESTAMP){
        await defiAvgPriceContract.setTokenPrice(testToken.address, itemIter, initTokenPrice++);
      }
      // 1000 ~ 1150 (31 + 28 + 31 + 30 + 31 -1)
      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_2021_1_1, TIME_2021_5_31)).to.eq(1075);
    })
  });
});
