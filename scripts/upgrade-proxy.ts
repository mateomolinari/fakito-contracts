import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = "";

  const FakitoV2 = await ethers.getContractFactory("Fakito");
  const implementation2 = await upgrades.upgradeProxy(proxyAddress, FakitoV2);
  console.log("New implementation deployed to:", implementation2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
