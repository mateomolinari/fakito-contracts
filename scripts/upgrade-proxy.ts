import { ethers, upgrades } from "hardhat";

async function main() {
  // UPGRADING
  const proxyAddress = "0xF510cb87dCDCe6869B867E4c6CE027585D45779e";
  const FakitoV2 = await ethers.getContractFactory("Fakito2");
  const implementation2 = await upgrades.upgradeProxy(proxyAddress, FakitoV2);
  console.log("New implementation deployed to:", implementation2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
