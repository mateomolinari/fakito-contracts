import { ethers, upgrades } from "hardhat";

async function main() {
  const fakito = "0x31B277042AAa8c45A5Cb47fD2188cAD0f8e95f95";

  const Fakito = await ethers.getContractFactory("Fakito");
  const instance = await upgrades.deployProxy(Fakito, [fakito], {
    kind: "uups",
  });

  await instance.deployed();

  console.log("Fakito's collection deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
