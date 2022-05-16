const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { shouldDeploy } = require("./REPToken/REPTokenShouldDeploy.spec");

describe("Unit tests", async () => {
  // describe(`REPToken`, async () => {
  //   let addrs;
  //   beforeEach(async function () {
  //     // const REPTokenContract = await ethers.getContractFactory("REPToken");
  //     // [...addrs] = await ethers.getSigners();
  //     // const REPToken = await REPTokenContract.deploy(1000, []);
  //     // await REPToken.deployed();
  //     // this.REPToken = REPToken;
  //     // console.log(REPTokenContract);
  //   });

  //   // shouldDeploy();
  //   it(`should revert if the token amount is not greater than zero`, async function () {
  //     const REPTokenContract = await ethers.getContractFactory("REPToken");
  //     const REPToken = await REPTokenContract.deploy(1000, []);
  //     await REPToken.deployed();

  //     console.log(REPToken);
  //   });
  // });
  describe(`Appraiser`, async () => {
    let addrs;
    beforeEach(async function () {
      [...addrs] = await ethers.getSigners();
      const Appraiser = await ethers.getContractFactory("Appraiser");
      const appraiser = await Appraiser.deploy();
      await appraiser.deployed();
      this.appraiser = appraiser;
    });

    // shouldDeploy();
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiser.owner()).to.equal(addrs[0].address);
    });
  });
});
