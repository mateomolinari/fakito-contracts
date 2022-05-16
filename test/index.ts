// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line node/no-extraneous-import
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
const ABI = require("../artifacts/contracts/Fakito.sol/Fakito.json");

describe("Fakito", function () {
  // eslint-disable-next-line no-unused-vars
  let instance: Contract, admin: any;

  beforeEach(async function () {
    [admin] = await ethers.getSigners();

    const Fakito = await ethers.getContractFactory("Fakito");
    instance = await upgrades.deployProxy(Fakito, [admin.address], {
      kind: "uups",
    });
    await instance.deployed();
  });
  describe("Upgrading", function () {
    it("Admin should be able to upgrade", async function () {
      const adminInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        admin
      );
      const FakitoV2 = await ethers.getContractFactory("Fakito");
      const instance2 = await FakitoV2.deploy();
      await expect(adminInstance.upgradeTo(instance2.address)).to.not.be
        .reverted;
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
      await expect(instance.mint(1, 1, "link1", true, "oncePerOwner")).to.not.be
        .reverted;
    });
    it("Nobody else should be able to mint", async function () {
      const account = await ethers.getSigners();

      const testInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        account[1]
      );
      await expect(
        testInstance.mint(1, 1, "link1", true, "oncePerOwner")
      ).to.be.revertedWith(
        `AccessControl: account ${account[1].address.toLowerCase()} is missing role 0xe31d31cdc4f3066becd587227a60ad50dbbf9ff24edec2103c2fc090a31d20e9`
      );
    });
    it("Should fail on minting with used id", async function () {
      await instance.mint(1, 15, "link1", false, "none");

      await expect(
        instance.mint(1, 1, "link1", true, "oncePerOwner")
      ).to.be.revertedWith("token id not available");
    });
  });

  describe("URI", function () {
    it("Should retrieve custom URI", async function () {
      await instance.mint(1, 20, "link1", false, "none");
      await instance.mint(2, 1, "link2", true, "oncePerOwner");

      expect(await instance.uri(1)).to.equal("link1");
      expect(await instance.uri(2)).to.equal("link2");
    });
    it("Should fail on non-existent token", async function () {
      await expect(instance.uri(3)).to.be.revertedWith("token does not exist");
    });
  });

  describe("Modifying URIs", function () {
    it("Should revert on immutable token", async function () {
      await instance.mint(1, 20, "link1", false, "none");

      await expect(instance.modifyNFT(1, "newuri")).to.be.revertedWith(
        "immutable token"
      );
    });
    it("Owner should be able to modify", async function () {
      await instance.mint(1, 1, "initial", false, "oncePerOwner");

      await expect(instance.modifyNFT(1, "newuri")).to.not.be.revertedWith;
    });
    it("Non-owner should not be able to modify", async function () {
      await instance.mint(1, 1, "initial", true, "oncePerOwner");
      const account = await ethers.getSigners();

      const testInstance = new ethers.Contract(
        instance.address,
        ABI.abi,
        account[15]
      );
      await expect(testInstance.modifyNFT(1, "newuri")).to.be.revertedWith(
        "not allowed to modify this nft"
      );
    });
    it("Should retrieve new uri", async function () {
      await instance.mint(1, 1, "initial", true, "oncePerOwner");
      await instance.modifyNFT(1, "newuri");

      expect(await instance.uri(1)).to.be.equal("newuri");
    });
    it("Should not allow to modify twice by same owner", async function () {
      await instance.mint(1, 1, "initial", true, "oncePerOwner");
      await instance.modifyNFT(1, "newuri");

      await expect(instance.modifyNFT(1, "seconduri")).to.be.revertedWith(
        "already modified"
      );
    });
  });
});
