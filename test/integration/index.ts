import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import Integration from "./integration.spec";

describe("Integration tests", async () => {
  before(async function () {
    const wallets = waffle.provider.getWallets();
    this.loadFixture = waffle.createFixtureLoader(wallets);

    this.signers = wallets;

    this.users = {};
    this.orgs = {};

    this.users.deployer = this.signers[0];
    this.users.ashylarry = this.signers[1];
    this.users.tybiggums = this.signers[2];
    this.users.rickjames = this.signers[3];
    this.users.dave = this.signers[4];
    this.users.prince = this.signers[5];

    this.orgs.WacArnolds = this.signers[10];
    this.orgs.studio54 = this.signers[11];
  });
  describe(`Appraiser`, async () => {
    beforeEach(async function () {
      const Reviewer = await ethers.getContractFactory(`Reviewer`);
      const reviewer = await Reviewer.connect(this.users.deployer).deploy();
      await reviewer.deployed();

      const Appraiser = await ethers.getContractFactory(`Appraiser`);
      const appraiser = await Appraiser.connect(this.users.deployer).deploy(
        reviewer.address
      );
      await appraiser.deployed();

      this.appraiser = appraiser;
      this.reviewer = reviewer;

      this.orgs.WacArnolds.name = "WacArnolds";
      this.orgs.WacArnolds.addr = this.orgs.WacArnolds.address;
      this.orgs.WacArnolds.URI = "ipfs://WacArnolds/";

      this.orgs.studio54.name = "studio54";
      this.orgs.studio54.addr = this.orgs.studio54.address;
      this.orgs.studio54.URI = "ipfs://studio54/";
    });
    Integration.shouldManageOrgs();
    // shouldManageReviews();
    // shouldManageReviewsRatings();
  });
});
