const { expect } = require("chai");
const {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
} = require("../shared/fixtures");
const { ethers, waffle } = require("hardhat");
const Appraiser = require("./Appraiser/Appraiser.spec");
const AppraiserOrganization = require("./AppraiserOrganization/AppraiserOrganization.spec");

describe("Unit tests", async () => {
  before(async function () {
    const wallets = waffle.provider.getWallets();
    this.loadFixture = waffle.createFixtureLoader(wallets);

    this.signers = await ethers.getSigners();
  });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const { appraiser, mockAppraiserOrganization } = await this.loadFixture(
        unitAppraiserFixture
      );

      this.appraiser = appraiser;

      this.mocks = {};
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;
    });
    Appraiser.shouldDeploy();
    Appraiser.shouldManageOrgs();
    Appraiser.shouldManageReviews();
    Appraiser.shouldManageReviewsRatings();
  });
  describe(`AppraiserOrganization`, async () => {
    beforeEach(async function () {
      const { appraiserOrganization, constructorParams } =
        await this.loadFixture(unitAppraiserOrganizationFixture);
      this.appraiserOrganization = appraiserOrganization;
      this.constructorParams = constructorParams;
    });
    // AppraiserOrganization.shouldDeploy();
    // AppraiserOrganization.shouldMintReviewNFT();
    // shouldManageReviews();
    // shouldManageReviewsRatings();
  });
});
