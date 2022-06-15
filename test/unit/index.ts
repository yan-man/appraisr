import { ethers, waffle } from "hardhat";
import { Wallet } from "ethers";
import {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
  unitReviewerFixture,
  unitVRFv2ConsumerFixture,
} from "../shared/fixtures";
import {
  Appraiser,
  AppraiserOrganization,
  Verifier,
  Reviewer,
  MockVRFCoordinator,
  VRFv2Consumer as VRFv2ConsumerType,
} from "../../typechain";
import { Mocks, Orgs, Users } from "../shared/types";
import AppraiserSpec from "./Appraiser/Appraiser.spec";
import AppraiserOrganizationSpec from "./AppraiserOrganization/AppraiserOrganization.spec";
// import VerifierSpec from "./Verifier/Verifier.spec";
import ReviewerSpec from "./Reviewer/Reviewer.spec";
import { MockContract } from "ethereum-waffle";
// import VRFv2ConsumerSpec from "./VRFv2Consumer/VRFv2Consumer.spec";

describe("Unit tests", async () => {
  before(async function () {
    const wallets = waffle.provider.getWallets();
    this.loadFixture = waffle.createFixtureLoader(wallets);

    this.signers = wallets;
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
        mockVRFv2Consumer,
      }: {
        reviewer: Reviewer;
        mockAppraiserOrganization: MockContract;
        mockAppraiserOrganization2: MockContract;
        mockVRFv2Consumer: MockContract;
      } = await this.loadFixture(unitReviewerFixture);
      this.reviewer = reviewer;
      this.mocks.mockAppraiserOrganization = mockAppraiserOrganization;
      this.mocks.mockAppraiserOrganization2 = mockAppraiserOrganization2;
      this.mocks.mockVRFv2Consumer = mockVRFv2Consumer;
      this.users.sampleVRFv2Consumer = this.signers[6];

      this.mockedResponses = {
        mintReviewNFT: 100,
        mintReviewNFT2: 5,
      };

      await this.mocks.mockAppraiserOrganization?.mock.mintReviewNFT.returns(
        this.mockedResponses.mintReviewNFT
      );
      await this.mocks.mockAppraiserOrganization?.mock.voteOnReview.returns();
      await this.mocks.mockAppraiserOrganization2?.mock.mintReviewNFT.returns(
        this.mockedResponses.mintReviewNFT2
      );
      await this.mocks.mockAppraiserOrganization2?.mock.voteOnReview.returns();
    });
    ReviewerSpec.shouldDeploy();
    ReviewerSpec.shouldManageReviews();
    ReviewerSpec.shouldManageReviewsRatings();
  });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const {
        appraiser,
        mockAppraiserOrganization,
        mockVerifier,
      }: {
        appraiser: Appraiser;
        mockAppraiserOrganization: MockContract;
        mockVerifier: MockContract;
      } = await this.loadFixture(unitAppraiserFixture);

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
    AppraiserSpec.shouldDeploy();
    AppraiserSpec.shouldManageOrgs();
  });
  describe(`AppraiserOrganization`, async () => {
    beforeEach(async function () {
      const {
        appraiserOrganization,
        constructorParams,
        mockVerifier,
        verifier,
      }: {
        appraiserOrganization: AppraiserOrganization;
        constructorParams: any;
        mockVerifier: MockContract;
        verifier: Verifier;
      } = await this.loadFixture(unitAppraiserOrganizationFixture);
      this.appraiserOrganization = appraiserOrganization;
      this.constructorParams = constructorParams;
      this.mocks.mockVerifier = mockVerifier;
      this.verifier = verifier;
    });
    AppraiserOrganizationSpec.shouldDeploy();
    AppraiserOrganizationSpec.shouldMintReviewNFT();
    AppraiserOrganizationSpec.shouldVoteOnReviewNFT();
  });
  // describe(`Verifier`, async () => {
  //   beforeEach(async function () {
  //     const { verifier, constructorParams, mockAppraiser } =
  //       await this.loadFixture(unitVerifierFixture);
  //     this.verifier = verifier;
  //     this.constructorParams = constructorParams;
  //     this.mocks.mockAppraiser = mockAppraiser;
  //   });
  //   Verifier.shouldDeploy();
  //   Verifier.shouldSetContractAddress();
  //   Verifier.shouldMintAndTransferAndBurnNFT();
  //   Verifier.shouldSupportInterface();
  // });
  // describe(`VRFv2Consumer`, async () => {
  //   beforeEach(async function () {
  //     const { VRFv2Consumer, mockReviewer, mockVRFCoordinator } =
  //       await this.loadFixture(unitVRFv2ConsumerFixture);
  //     this.VRFv2Consumer = VRFv2Consumer;
  //     this.mocks.mockReviewer = mockReviewer;
  //     this.mocks.mockVRFCoordinator = mockVRFCoordinator;
  //   });
  //   VRFv2ConsumerSpec.shouldDeploy();
  //   // Verifier.shouldSetContractAddress();
  //   // Verifier.shouldMintAndTransferAndBurnNFT();
  //   // Verifier.shouldSupportInterface();
  // });
});
