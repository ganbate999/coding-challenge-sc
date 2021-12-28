import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("deploy:defiavgpriceV1", "Deploy DeFiAvgPrice Contract Version 1.0")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
   
    const DefiAvgPriceV1 = await ethers.getContractFactory("DeFiAvgPriceV1");
 
    const proxy = await upgrades.deployProxy(DefiAvgPriceV1, [], { initializer: 'initialize' });
    await proxy.deployed();

    console.log("Proxy version1 deployed => address:", proxy.address);
  });


task("deploy:defiavgpriceV2", "Deploy DeFiAvgPrice Contract Version 2.0")
  .addParam("proxy", "The proxy's address")
  .setAction(async( taskArguments: TaskArguments, {ethers, upgrades}) => {

    const DefiAvgPriceV2 = await ethers.getContractFactory("DeFiAvgPriceV2");

    const proxy = await upgrades.upgradeProxy(taskArguments.proxy, DefiAvgPriceV2);

    console.log("Proxy upgrade to version2 => address:", proxy.address);
  });


task("deploy:defiavgpriceV3", "Deploy DeFiAvgPrice Contract Version 3.0")
  .addParam("proxy", "The proxy's address")
  .setAction(async( taskArguments: TaskArguments, {ethers, upgrades}) => {
    
    const DefiAvgPriceV3 = await ethers.getContractFactory("DeFiAvgPriceV3");
    
    const proxy = await upgrades.upgradeProxy(taskArguments.proxy, DefiAvgPriceV3);

    console.log("Proxy upgrade to version3 => address:", proxy.address);
  });