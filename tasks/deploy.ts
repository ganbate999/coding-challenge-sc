import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("deploy:defiavgprice")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
   
    const DefiAvgPriceV1 = await ethers.getContractFactory("DeFiAvgPriceV1");
    const defiAvgPriceV1 = await DefiAvgPriceV1.deploy();

    await defiAvgPriceV1.deployed();

    console.log("DefiAvgPriceV1 deployed to:", defiAvgPriceV1.address);

    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy(defiAvgPriceV1.address);

    await proxy.deployed();

    console.log("Proxy version1 deployed => address:", proxy.address);

    const DefiAvgPriceV2 = await ethers.getContractFactory("DeFiAvgPriceV2");
    const defiAvgPriceV2 = await DefiAvgPriceV2.deploy();

    await defiAvgPriceV2.deployed();
    proxy.upgrade(defiAvgPriceV2.address);

    console.log("DefiAvgPriceV2 deployed to:", defiAvgPriceV2.address);
    console.log("Proxy upgrade to version2 => address:", proxy.address);

    const DefiAvgPriceV3 = await ethers.getContractFactory("DeFiAvgPriceV3");
    const defiAvgPriceV3 = await DefiAvgPriceV3.deploy();

    await defiAvgPriceV3.deployed();
    proxy.upgrade(defiAvgPriceV3.address);

    console.log("DefiAvgPriceV3 deployed to:", defiAvgPriceV3.address);
    console.log("Proxy upgrade to version2 => address:", proxy.address);
  });