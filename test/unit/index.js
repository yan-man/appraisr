const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { shouldDeploy } = require("./Appraiser/AppraiserShouldDeploy.spec");
const {
  shouldManageOrgs,
} = require("./Appraiser/AppraiserShouldSaveOrganization.spec");

describe("Unit tests", async () => {
  // describe(`REPToken`, async () => {
  //   beforeEach(async function () {
  //     const REPTokenFactory = await ethers.getContractFactory("REPToken");
  //     const REPToken = await REPTokenFactory.deploy(1000, []);
  //     await REPToken.deployed();
  //     this.REPToken = REPToken;
  //     this.addrs = await ethers.getSigners();
  //   });

  //   context(`#deploy`, async function () {
  //     it("*Happy Path: Should set the right owner", async function () {
  //       expect(await this.REPToken.owner()).to.equal(this.addrs[0].address);
  //     });
  //   });
  // });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const Appraiser = await ethers.getContractFactory("Appraiser");
      const appraiser = await Appraiser.deploy();
      await appraiser.deployed();
      this.appraiser = appraiser;
      this.addrs = await ethers.getSigners();
    });

    // shouldDeploy();
    shouldManageOrgs();
  });
});
