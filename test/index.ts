import { expect } from "chai";
import { Contract, ContractFactory } from 'ethers';
import { upgrades, ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const HOUR_TIMESTAMP = 3600;
const DAY_TIMESTAMP = 24 * HOUR_TIMESTAMP;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// 1 day
const TIME_DAY_1_HOUR_0  = 1 * DAY_TIMESTAMP + 0 * HOUR_TIMESTAMP;;
const TIME_DAY_1_HOUR_23 = 1 * DAY_TIMESTAMP + 23 * HOUR_TIMESTAMP;

// 2 day
const TIME_DAY_2_HOUR_0  = 2 * DAY_TIMESTAMP + 0 * HOUR_TIMESTAMP;
const TIME_DAY_2_HOUR_1  = 2 * DAY_TIMESTAMP + 1 * HOUR_TIMESTAMP;
const TIME_DAY_2_HOUR_2  = 2 * DAY_TIMESTAMP + 2 * HOUR_TIMESTAMP;
const TIME_DAY_2_HOUR_3  = 2 * DAY_TIMESTAMP + 3 * HOUR_TIMESTAMP;
const TIME_DAY_2_HOUR_4  = 2 * DAY_TIMESTAMP + 4 * HOUR_TIMESTAMP;
const TIME_DAY_2_HOUR_23 = 2 * DAY_TIMESTAMP + 23 * HOUR_TIMESTAMP;

// 3 day
const TIME_DAY_3_HOUR_0 = 3 * DAY_TIMESTAMP;
const TIME_DAY_3_HOUR_23 = 3 * DAY_TIMESTAMP + 23 * HOUR_TIMESTAMP;

function getUtcTimestampNow(){
  const now = new Date();
  return Math.floor(now.getTime()/1000);
  //return Math.floor((now.getTime() + now.getTimezoneOffset() * 60 * 1000)/1000);
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
      await expect(defiAvgPriceContract.connect(owner).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 1000 + ' Time: ' + TIME_DAY_1_HOUR_0 + ' Set by owner');

      /// TIME_DAY_1_HOUR_2 => 2000
      await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 2000 + ' Time: ' + TIME_DAY_1_HOUR_2 + ' Set by addr1');

      /// TIME_DAY_1_HOUR_4 => 3000
      await expect(defiAvgPriceContract.connect(addr2).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_4, 3000)).to.emit(defiAvgPriceContract, 'SetPrice');
      //console.log('Price: '  + 3000 + ' Time: ' + TIME_DAY_1_HOUR_4 + ' Set by addr2')
    });

    it("timestamp must be positive", async function() {
      await expect(defiAvgPriceContract.setTokenPrice(testToken.address, 0, 1000)).to.be.revertedWith('timestamp must be positive');
    });

    it("Past timestamp price can not be set", async function() {
        await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);

        await expect(defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_1_HOUR_0, 1000)).to.be.revertedWith('past timestamp');
    });

    it("Future timestamp price can not be set", async function() {
    
      const future_time = getUtcTimestampNow() + 60;

      //console.log('block timestamp', blockTime, future_time);
      await expect(defiAvgPriceContract.setTokenPrice(testToken.address, future_time, 1000)).to.be.revertedWith('future timestamp');
  });

    it("token address must not be zero", async function() {
      await expect(defiAvgPriceContract.setTokenPrice(ZERO_ADDRESS, TIME_DAY_2_HOUR_0, 1000)).to.revertedWith('token address must not be zero');
    });
  });

  describe("Version 1/get avg price", async function () {

    it("get avg price inner set time", async function() {

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

      // console.log('avg price', avgPrice);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_0, TIME_DAY_2_HOUR_2)).to.eq(1500);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_1, TIME_DAY_2_HOUR_3)).to.eq(2000);

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_4, 3000);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_2, TIME_DAY_2_HOUR_4)).to.eq(2500);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_1, TIME_DAY_2_HOUR_3)).to.eq(2000);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_3, TIME_DAY_2_HOUR_23)).to.eq(3000);

      expect(await defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_0, TIME_DAY_2_HOUR_4)).to.eq(2000);

    });
  
    it("start timestamp must be less than end timestamp", async function() {

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

      await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_2_HOUR_2, TIME_DAY_2_HOUR_0)).to.revertedWith('start timestamp must be less than end timestamp');
    });

    it("no price outsite of set time", async function() {

        await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);
        await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

        // before
        await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_1_HOUR_0, TIME_DAY_1_HOUR_23)).to.revertedWith('no price');

        // after
        await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_3_HOUR_0, TIME_DAY_3_HOUR_23)).to.revertedWith('no price');

    });

  });

  describe("Version 1/get daily price", async function () {

    it("token address must not be zero", async function() {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);

      await expect(defiAvgPriceContract.getDailyPrice(ZERO_ADDRESS, TIME_DAY_2_HOUR_0)).to.revertedWith('token address must not be zero');
    });

    
    it("get daily price", async function() {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_0)).to.eq(1000);
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_2)).to.eq(2000);
    });

        
    it("no price outside of set time", async function() {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

      await expect(defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_1_HOUR_0)).to.revertedWith('no price');
    });
  });

  describe("Version 2/Only owner set price", async function () {

    beforeEach(async () => {

      // set data on Version 1
      await defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);

      // Upgrade to Version 2
      defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV2);
      //   console.log('AvgPriceContract Upgraded V1 => V2 : ' + defiAvgPriceContract.address);
    });

    it("owner set price", async function() {

      await expect(defiAvgPriceContract.connect(owner).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_1, 2000)).to.emit(defiAvgPriceContract, 'SetPrice');
    });

    
    it("other can not set price", async function() {

      await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, TIME_DAY_2_HOUR_1, 2000)).to.revertedWith('Ownable: caller is not the owner');
    });

    it("keep data after upgrading", async function () {

      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_0)).to.eq(1000)
      //console.log('Price: '  + 1000 + ' Time: ' + TIME_DAY_2_HOUR_0 + ' Read data successfully (kept data when upgrading)');
    });

  });

  describe("Version 3/ The price for a day can be set on the same day", async function () {

    beforeEach(async () => {

      // Upgrade to Version 3
      defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV3);
      //   console.log('AvgPriceContract Upgraded V1 => V3 : ' + defiAvgPriceContract.address);

    });

    it('The price for a day can be set on the same day', async () => {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_2, 2000);

      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_4, 3000);

      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_0)).to.eq(3000);
      
      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_2)).to.eq(3000);

      //console.log('Get Token Price Time: TIME_DAY_2_HOUR_0 => Expected: 3000');
      expect(await defiAvgPriceContract.getDailyPrice(testToken.address, TIME_DAY_2_HOUR_4)).to.eq(3000);
    })

    it('no price outside of day', async () => {
      await defiAvgPriceContract.setTokenPrice(testToken.address, TIME_DAY_2_HOUR_0, 1000);

      // before
      await expect(defiAvgPriceContract.getAvgPrice(testToken.address, TIME_DAY_1_HOUR_0, TIME_DAY_1_HOUR_23)).to.revertedWith('no price');
    })
  });
});