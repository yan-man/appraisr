const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const Integration = require("./integration.spec");

describe("Integration tests", async () => {
  before(async function () {
    const wallets = waffle.provider.getWallets();
    this.loadFixture = waffle.createFixtureLoader(wallets);

    this.signers = await ethers.getSigners();

    this.users = {};
    this.orgs = {};

    this.users.deployer = this.signers[0];
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
      const appraiserFactory = await ethers.getContractFactory(`Appraiser`);
      const appraiser = await appraiserFactory
        .connect(this.users.deployer)
        .deploy();
      await appraiser.deployed();

      this.appraiser = appraiser;

      this.companies = {
        wacarnolds: {
          orgId: 0,
          name: "WacArnolds",
          addr: this.orgs.wacarnolds.address,
          URI: "ipfs://WacArnolds/",
        },
        studio54: {
          orgId: 1,
          name: "studio54",
          addr: this.orgs.studio54.address,
          URI: "ipfs://studio54/",
        },
      };
    });
    Integration.shouldManageOrgs();
    // shouldManageReviews();
    // shouldManageReviewsRatings();
  });
});
