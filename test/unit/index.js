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
    
    this.users = {};
    this.orgs = {};

    this.users.deployer = this.signers[0]; // in practice, this would be the Appraiser contract
    this.users.ashylarry = this.signers[1];
    this.users.tybiggums = this.signers[2];
    this.users.rickjames = this.signers[3];
    this.users.dave = this.signers[4];
    this.users.prince = this.signers[5];

    this.orgs.wacarnolds = this.signers[10];
    this.orgs.studio54 = this.signers[11];
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
    // AppraiserOrganization.shouldDeploy();
    AppraiserOrganization.shouldMintReviewNFT();
    // shouldManageReviews();
    // shouldManageReviewsRatings();
  });
});
