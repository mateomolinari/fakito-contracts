// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line node/no-extraneous-import
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
const ABI = require("../artifacts/contracts/Fakito.sol/Fakito.json");

describe("Fakito", function () {
  // eslint-disable-next-line no-unused-vars
  let instance: Contract, fakito: any, fakitoInstance: Contract;

  beforeEach(async function () {
    [fakito] = await ethers.getSigners();

    const Fakito = await ethers.getContractFactory("Fakito");
    instance = await upgrades.deployProxy(Fakito, [fakito.address], {
      kind: "uups",
    });
    await instance.deployed();

    fakitoInstance = new ethers.Contract(instance.address, ABI.abi, fakito);
  });
  describe("Upgrading", function () {
    it("Admin should be able to upgrade", async function () {
      const FakitoV2 = await ethers.getContractFactory("Fakito");
      const instance2 = await FakitoV2.deploy();
      await expect(instance.upgradeTo(instance2.address)).to.not.be.reverted;
    });
    it("Non-admin should not be able to upgrade", async function () {
      const account = await ethers.getSigners();
      const testInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        account[10]
      );
      const FakitoV2 = await ethers.getContractFactory("Fakito");
      const instance2 = await FakitoV2.deploy();
      await expect(testInstance.upgradeTo(instance2.address)).to.be.reverted;
    });
  });
  describe("Minting", function () {
    it("Fakito should be able to mint", async function () {
      await expect(fakitoInstance.safeMint("link1", "OncePerOwner", 1)).to.not
        .be.reverted;
    });
    it("Nobody else should be able to mint", async function () {
      const account = await ethers.getSigners();

      const testInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        account[3]
      );
      await expect(
        testInstance.safeMint("link1", "OncePerOwner", true)
      ).to.be.revertedWith(
        `AccessControl: account ${account[3].address.toLowerCase()} is missing role 0xe31d31cdc4f3066becd587227a60ad50dbbf9ff24edec2103c2fc090a31d20e9`
      );
    });
  });

  describe("URI", function () {
    it("Should retrieve custom URI", async function () {
      await fakitoInstance.safeMint("link1", "none", false);
      await fakitoInstance.safeMint("link2", "OncePerOwner", true);

      expect(await fakitoInstance.tokenURI(0)).to.equal("link1");
      expect(await fakitoInstance.tokenURI(1)).to.equal("link2");
    });
    it("Should fail on non-existent token", async function () {
      await expect(fakitoInstance.tokenURI(3)).to.be.reverted;
    });
  });

  describe("Modifying URIs", function () {
    it("Should revert on immutable token", async function () {
      await fakitoInstance.safeMint("link1", "none", false);

      await expect(fakitoInstance.modifyNFT(0, "newuri")).to.be.revertedWith(
        "immutable token"
      );
    });
    it("Owner should be able to modify", async function () {
      await fakitoInstance.safeMint("initial", "OncePerOwner", true);

      await expect(fakitoInstance.modifyNFT(0, "newuri")).to.not.be.reverted;
    });
    it("Non-owner should not be able to modify", async function () {
      await fakitoInstance.safeMint("initial", "OncePerOwner", true);
      const account = await ethers.getSigners();

      const testInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        account[15]
      );
      await expect(testInstance.modifyNFT(0, "newuri")).to.be.revertedWith(
        "not owner"
      );
    });
    it("Should retrieve new uri", async function () {
      await fakitoInstance.safeMint("initial", "OncePerOwner", true);
      await fakitoInstance.modifyNFT(0, "newuri");

      expect(await instance.tokenURI(0)).to.be.equal("newuri");
    });
    it("Should not allow to modify twice by same owner", async function () {
      await fakitoInstance.safeMint("initial", "OncePerOwner", true);
      await fakitoInstance.modifyNFT(0, "newuri");

      await expect(fakitoInstance.modifyNFT(0, "seconduri")).to.be.reverted;
    });
  });
});
