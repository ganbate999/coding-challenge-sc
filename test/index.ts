import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Signer } from 'ethers';
import DeFiAvgPriceV1ABI from "../data/abi/DeFiAvgPriceV1.json";
import DeFiAvgPriceV2ABI from "../data/abi/DeFiAvgPriceV2.json";
import DeFiAvgPriceV3ABI from "../data/abi/DeFiAvgPriceV3.json";

describe("DeFiAvgPrice Test ...........", function () {

  let testToken: Contract;
  let proxy: Contract;
  let defiAvgPriceV1: Contract;
  let defiAvgPriceV2: Contract;
  let defiAvgPriceV3: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken", owner);
    testToken = await TestToken.deploy("TDT Token", "TDT", 10000);

    await testToken.deployed();

    console.log("Token deployed to:", testToken.address);

    const DefiAvgPriceV1 = await ethers.getContractFactory("DeFiAvgPriceV1", owner);
    defiAvgPriceV1 = await DefiAvgPriceV1.deploy();

    const Proxy = await ethers.getContractFactory("Proxy");
    proxy = await Proxy.deploy(defiAvgPriceV1.address);

    const DefiAvgPriceV2 = await ethers.getContractFactory("DeFiAvgPriceV2", owner);
    defiAvgPriceV2 = await DefiAvgPriceV2.deploy();

    const DefiAvgPriceV3 = await ethers.getContractFactory("DeFiAvgPriceV3", owner);
    defiAvgPriceV3 = await DefiAvgPriceV3.deploy();

  });

  it("Version 1/Anyone set price", async function () {

    const defiAvgPriceContract = await ethers.getContractAt(DeFiAvgPriceV1ABI, proxy.address, owner);

    /// 2021/1/1 00:00:00 (GMT) => 1000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609459200, 1000);
    /// 2021/1/1 01:00:00 (GMT) => 2000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609462800, 2000);
    /// 2021/1/1 02:00:00 (GMT) => 3000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609466400, 3000);

    /// 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Average Price == 2000
    expect(await defiAvgPriceContract.getAvgPrice(testToken.address, 1609459200, 1609466400)).to.eq(2000);
    /// 2021/1/1 00:00:00 (GMT) => Price == 1000
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200)).to.eq(1000);
    /// 2021/1/1 02:00:00 (GMT) => Price == 3000
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609466400)).to.eq(3000);

  });

  
  it("Version 2/Only owner set price", async function () {

    let defiAvgPriceContract = await ethers.getContractAt(DeFiAvgPriceV1ABI, proxy.address, owner);

    /// 2021/1/1 00:00:00 (GMT) => 1000 in Version 1
    await defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, 1609459200, 1000);

    /// Upgrade to Version 2
    await proxy.upgrade(defiAvgPriceV2.address);

    defiAvgPriceContract = await ethers.getContractAt(DeFiAvgPriceV2ABI, proxy.address, owner);
    
    /// 2021/1/1 00:00:00 (GMT) => Price in Version 2 === 1000
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200)).to.eq(1000)

    /// 2021/1/1 00:00:00 (GMT) => Only owner can set price in Version 2
    await expect(defiAvgPriceContract.connect(addr1).setTokenPrice(testToken.address, 1609462800, 2000)).to.be.revertedWith("Ownable: caller is not the owner");

    /// 2021/1/1 01:00:00 (GMT) => Price in Version 2 === 2000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609462800, 2000);
    /// 2021/1/1 02:00:00 (GMT) => Price in Version 2 === 3000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609466400, 3000);

    /// 2021/1/1 00:00:00 (GMT) ~ 2021/1/1 02:00:00 (GMT) => Average Price == 2000
    expect(await defiAvgPriceContract.getAvgPrice(testToken.address, 1609430500, 1609466400)).to.eq(2000);
  });

  it("Version 3/ The price for a day can be set on the same day", async function () {

    /// Upgrade to Version 3
    await proxy.upgrade(defiAvgPriceV3.address);
    
    const defiAvgPriceContract = await ethers.getContractAt(DeFiAvgPriceV3ABI, proxy.address, owner);
    
    /// 2021/1/1 00:00:00 (GMT) => 1000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609459200, 1000);

    /// 2021/1/1 01:00:00 (GMT) => 1000
    await defiAvgPriceContract.setTokenPrice(testToken.address, 1609462800, 2000);

    /// 2021/1/1 00:00:00 (GMT) => Price == 2000
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609459200)).to.eq(2000);

    /// 2021/1/1 02:00:00 (GMT) => Price == 2000
    expect(await defiAvgPriceContract.getDailyPrice(testToken.address, 1609466400)).to.eq(2000);
  });
});
