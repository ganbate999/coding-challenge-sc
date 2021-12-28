import { expect } from "chai";
import { Contract, ContractFactory } from 'ethers';
import { upgrades, ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

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

    console.log("Token deployed to:", testToken.address);

    DefiAvgPriceV1 = await ethers.getContractFactory("DeFiAvgPriceV1", owner);
    defiAvgPriceContract = await upgrades.deployProxy(DefiAvgPriceV1, [], { initializer: 'initialize' });

    DefiAvgPriceV2 = await ethers.getContractFactory("DeFiAvgPriceV2", owner);

    DefiAvgPriceV3 = await ethers.getContractFactory("DeFiAvgPriceV3", owner);
  });

  it("Version 1/Anyone set price", async function () {

    /// 2021/1/1 00:00:00 (GMT) => 1000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609459200, 1000);
    console.log('Price: '  + 1000 + ' Time: ' + 1609459200 + ' Set by owner');

    /// 2021/1/1 01:00:00 (GMT) => 2000
    await defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, 1609462800, 2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609462800 + ' Set by addr1');

    /// 2021/1/1 02:00:00 (GMT) => 3000
    await defiAvgPriceContract.connect(addr2).setTokenPrice(testToken.address, 1609466400, 3000);
    console.log('Price: '  + 3000 + ' Time: ' + 1609466400 + ' Set by addr2');


    /// 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Average Price == 2000
    let avgPrice = await defiAvgPriceContract.getAvgPrice(testToken.address, 1609459200, 1609466400);
    expect(avgPrice).to.eq(2000);
    console.log('Avg Price: '  + avgPrice + ' Time: ' + 1609459200 + ' ~ ' + 1609466400 + " iner set time range");


    /// "No Price" reverted => time range before 2021/1/1 00:00:00 (GMT)
    console.log("'No Price' will be reverted => time range before 2021/1/1 00:00:00 (GMT)");
    await expect(defiAvgPriceContract.getAvgPrice(testToken.address, 1609459100, 1609459150)).to.be.revertedWith("no price");
    console.log('Reverted: "no price" Time: ' + 1609459200 + ' ~ ' + 1609466400 + " before set time range");


    /// 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Average Price == 2000
    console.log("'No Price' will be reverted => time range after 2021/1/1 02:00:00 (GMT)");
    await expect( defiAvgPriceContract.getAvgPrice(testToken.address, 1609466500, 1609466600)).to.be.revertedWith("no price");
    console.log('Reverted: "no price" Time: ' + 1609466500 + ' ~ ' + 1609466600 + " after set time range");


    /// 2021/1/1 00:00:00 (GMT) => Price == 1000
    const price1 = await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200);
    expect(price1).to.eq(1000);
    console.log('Price: '  + price1 + ' Time: ' + 1609459200 + " 2021/1/1 00:00:00 (GMT)");
    

    /// 2021/1/1 01:30:00 (GMT) => Price == 3000
    const price2 = await defiAvgPriceContract.getDailyPrice(testToken.address, 1609464600)
    expect(price2).to.eq(2000);
    console.log('Price: '  + price2 + ' Time: ' + 1609466400 + " 2021/1/1 01:30:00 (GMT)");

    /// 2021/1/1 02:00:00 (GMT) => Price == 3000
    const price3 = await defiAvgPriceContract.getDailyPrice(testToken.address, 1609466400)
    expect(price3).to.eq(3000);
    console.log('Price: '  + price3 + ' Time: ' + 1609466400 + " 2021/1/1 02:00:00 (GMT)");

    /// "No Price" reverted => time after 2021/1/1 02:00:00 (GMT)
    const price4 = await defiAvgPriceContract.getDailyPrice(testToken.address, 1609466500);
    expect(price4).to.eq(3000);
    console.log('Price: '  + price4 + ' Time: ' +  1609466500 + " after set time range");

    /// "No Price" reverted => time before 2021/1/1 00:00:00 (GMT)
    console.log("'No Price' will be reverted => time range before 2021/1/1 00:00:00 (GMT)");
    await expect( defiAvgPriceContract.getDailyPrice(testToken.address, 1609459100)).to.be.revertedWith("no price");
    console.log('Reverted: "no price" Time: ' + 1609459100 + " before set time range");
  });

  
  it("Version 2/Only owner set price", async function () {

    /// 2021/1/1 00:00:00 (GMT) => 1000 in Version 1
    await defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, 1609459200, 1000);
    console.log('Price: '  + 1000 + ' Time: ' + 1609459200 + ' Set by addr1 on Version 1');


    /// Upgrade to Version 2
    defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV2);
    console.log('AvgPriceContract Upgraded V1 => V2 : ' + defiAvgPriceContract.address);


    /// 2021/1/1 00:00:00 (GMT) => Price in Version 2 === 1000
    console.log('Read data set on V1 : expected: 1000');
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200)).to.eq(1000)
    console.log('Price: '  + 1000 + ' Time: ' + 1609459200 + ' Read data successfully (kept data when upgrading)');


    /// 2021/1/1 00:00:00 (GMT) => Only owner can set price in Version 2
    console.log('Set Token Price by addr1 : expected => reverted with "Ownable: caller is not the owner"');
    await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, 1609462800, 2000)).to.be.revertedWith("Ownable: caller is not the owner");
    console.log("setTokenPrice :  Reverted With Error 'Ownable: caller is not the owner'");

    /// 2021/1/1 01:00:00 (GMT) => Price in Version 2 === 2000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609462800, 2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609462800 + ' Set by owner on Version 2');

    /// 2021/1/1 02:00:00 (GMT) => Price in Version 2 === 3000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609466400, 3000);
    console.log('Price: '  + 3000 + ' Time: ' + 1609466400 + ' Set by owner on Version 2');

    /// 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Average Price == 2000
    console.log('getAvgPrice between 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Expected Average Price == 2000');
    const avgPrice = await defiAvgPriceContract.getAvgPrice(testToken.address, 1609430500, 1609466400);
    expect(avgPrice).to.eq(2000);
    console.log('Avg Price: '  + avgPrice + ' Time: ' + 1609430500 + ' ~ ' + 1609466400 + ' 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT)');
  });

  it("Version 3/ The price for a day can be set on the same day", async function () {

    /// Upgrade to Version 3
    defiAvgPriceContract = await upgrades.upgradeProxy(defiAvgPriceContract.address, DefiAvgPriceV3);
    console.log('AvgPriceContract Upgraded V2 => V3 : ' + defiAvgPriceContract.address);
 
    /// 2021/1/1 00:00:00 (GMT) => 1000
    console.log('Set Token Price Time: 2021/1/1 00:00:00 (GMT) => 1000');
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609459200, 1000);
    console.log('Price: '  + 1000 + ' Time: ' + 1609459200 + ' Set by owner on Version 3');

    /// 2021/1/1 01:00:00 (GMT) => 2000
    console.log('Set Token Price Time: 2021/1/1 01:00:00 (GMT) => 2000');
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609462800, 2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609462800 + ' Set by owner on Version 3');

    /// 2021/1/1 00:00:00 (GMT) => Price == 2000
    console.log('Get Token Price Time: 2021/1/1 00:00:00 (GMT) => Expected: 2000');
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200)).to.eq(2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609459200);

    /// 2021/1/1 02:00:00 (GMT) => Price == 2000
    console.log('Get Token Price Time: 2021/1/1 02:00:00 (GMT) => Expected: 2000');
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609466400)).to.eq(2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609466400);

    /// 2021/1/1 03:00:00 (GMT) => Price == 2000
    console.log('Get Token Price Time: 2021/1/1 03:00:00 (GMT) => Expected: 2000');
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609470000)).to.eq(2000);
    console.log('Price: '  + 2000 + ' Time: ' + 1609470000);

    /// "No Price" reverted => time before 2020/12/31 00:00:00 (GMT)
    console.log("'No Price' will be reverted => time range before 2020/12/31 00:00:00 (GMT)");
    await expect( defiAvgPriceContract.getDailyPrice(testToken.address, 1609372800)).to.be.revertedWith("no price");
    console.log('Reverted: "no price" Time: ' + 1609372800 + " before set time range");
  });
});