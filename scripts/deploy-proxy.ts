import { ethers, upgrades } from "hardhat";

async function main() {
  const admin = "0x2546bcd3c84621e976d8185a91a922ae77ecec30";

  const Fakito = await ethers.getContractFactory("Fakito");
  const instance = await upgrades.deployProxy(Fakito, [admin], {
    kind: "uups",
  });

  await instance.deployed();

  console.log("Fakito's collection deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
