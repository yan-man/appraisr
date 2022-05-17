const { expect } = require("chai");
const { unitAppraiserFixture } = require("../shared/fixtures");
const { ethers, waffle } = require("hardhat");
const {
  shouldDeploy,
  shouldManageOrgs,
  shouldManageReviews,
} = require("./Appraiser/Appraiser.spec");

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
  //       console.log(await this.REPToken.name());
  //       // expect(await this.REPToken.name()).to.equal(this.addrs[0].address);
  //     });
  //   });
  // });
  describe(`Appraiser`, async () => {
    before(async function () {
      const wallets = waffle.provider.getWallets();
      this.loadFixture = waffle.createFixtureLoader(wallets);
    });
    beforeEach(async function () {
      const { appraiser, mockAppraiserOrganization } = await this.loadFixture(
        unitAppraiserFixture
      );

      this.appraiser = appraiser;

      this.mocks = {};
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;

      this.signers = await ethers.getSigners();
    });
    shouldDeploy();
    shouldManageOrgs();
    shouldManageReviews();
  });
});
