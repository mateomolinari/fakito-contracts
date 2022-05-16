import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Fakito", function () {
  it("Should deploy proxy", async function () {
    const admin = "0x2546bcd3c84621e976d8185a91a922ae77ecec30";

    const Fakito = await ethers.getContractFactory("Fakito");
    const instance = await upgrades.deployProxy(Fakito, [admin], {
      kind: "uups",
    });

    await instance.deployed();

    expect(await instance.greet()).to.equal("Hola, mundo!");
  });
});