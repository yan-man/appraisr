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
    this.mocks = {};
  });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const { appraiser, mockAppraiserOrganization, mockVerifier } =
        await this.loadFixture(unitAppraiserFixture);

      this.appraiser = appraiser;
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;
      this.mocks.mockVerifier = mockVerifier;
    });
    Appraiser.shouldDeploy();
    Appraiser.shouldManageOrgs();
    Appraiser.shouldManageReviews();
    Appraiser.shouldManageReviewsRatings();
  });
  describe(`AppraiserOrganization`, async () => {
    beforeEach(async function () {
      const { appraiserOrganization, constructorParams, mockVerifier } =
        await this.loadFixture(unitAppraiserOrganizationFixture);
      this.appraiserOrganization = appraiserOrganization;
      this.constructorParams = constructorParams;
      this.mocks.mockVerifier = mockVerifier;
    });
    AppraiserOrganization.shouldDeploy();
    AppraiserOrganization.shouldMintReviewNFT();
    // shouldManageReviews();
    // shouldManageReviewsRatings();
  });
});
