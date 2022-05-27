const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

const {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
  unitReviewerFixture,
} = require("../shared/fixtures");
const Appraiser = require("./Appraiser/Appraiser.spec");
const AppraiserOrganization = require("./AppraiserOrganization/AppraiserOrganization.spec");
const Verifier = require("./Verifier/Verifier.spec");
const Reviewer = require("./Reviewer/Reviewer.spec");

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

    this.orgs.WacArnolds = this.signers[10];
    this.orgs.studio54 = this.signers[11];
  });
  describe(`Reviewer`, async () => {
    beforeEach(async function () {
      const {
        reviewer,
        mockAppraiserOrganization,
        mockAppraiserOrganization2,
      } = await this.loadFixture(unitReviewerFixture);
      this.reviewer = reviewer;
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;
      this.mocks.mockAppraiserOrganization2 = mockAppraiserOrganization2;

      this.mockedResponses = {
        mintReviewNFT: 100,
        mintReviewNFT2: 5,
      };
      await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
        this.mockedResponses.mintReviewNFT
      );
      await this.mocks.mockAppraiserOrganization.mock.voteOnReview.returns();
      await this.mocks.mockAppraiserOrganization2.mock.mintReviewNFT.returns(
        this.mockedResponses.mintReviewNFT2
      );
      await this.mocks.mockAppraiserOrganization2.mock.voteOnReview.returns();
    });
    Reviewer.shouldDeploy();
    Reviewer.shouldManageReviews();
    Reviewer.shouldManageReviewsRatings();
  });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const { appraiser, mockAppraiserOrganization, mockVerifier } =
        await this.loadFixture(unitAppraiserFixture);

      this.appraiser = appraiser;
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;
      this.mocks.mockVerifier = mockVerifier;

      this.orgs.WacArnolds.name = "WacArnolds";
      this.orgs.WacArnolds.addr = this.orgs.WacArnolds.address;
      this.orgs.WacArnolds.URI = "ipfs://WacArnolds/";

      this.orgs.studio54.name = "studio54";
      this.orgs.studio54.addr = this.orgs.WacArnolds.address;
      this.orgs.studio54.URI = "ipfs://studio54/";
    });
    Appraiser.shouldDeploy();
    Appraiser.shouldManageOrgs();
  });
  describe(`AppraiserOrganization`, async () => {
    beforeEach(async function () {
      const {
        appraiserOrganization,
        constructorParams,
        mockVerifier,
        verifier,
      } = await this.loadFixture(unitAppraiserOrganizationFixture);
      this.appraiserOrganization = appraiserOrganization;
      this.constructorParams = constructorParams;
      this.mocks.mockVerifier = mockVerifier;
      this.verifier = verifier;
    });
    AppraiserOrganization.shouldDeploy();
    AppraiserOrganization.shouldMintReviewNFT();
    AppraiserOrganization.shouldVoteOnReviewNFT();
  });
  describe(`Verifier`, async () => {
    beforeEach(async function () {
      const { verifier, constructorParams, mockAppraiser } =
        await this.loadFixture(unitVerifierFixture);
      this.verifier = verifier;
      this.constructorParams = constructorParams;
      this.mocks.mockAppraiser = mockAppraiser;
    });
    Verifier.shouldDeploy();
    Verifier.shouldSetContractAddress();
    Verifier.shouldMintAndTransferAndBurnNFT();
    Verifier.shouldSupportInterface();
  });
});
