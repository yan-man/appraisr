const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.VRFv2Consumer.owner()).to.equal(
        this.users.deployer.address
      );
    });
    it("should revert on requestRandomWords from non owner", async function () {
      await expect(
        this.VRFv2Consumer.connect(this.users.ashylarry).requestRandomWords(
          0,
          0
        )
      ).to.be.reverted;
    });
    it("should requestRandomWords from owner", async function () {
      await expect(
        this.VRFv2Consumer.connect(this.users.deployer).requestRandomWords(0, 0)
      ).to.not.be.reverted;
    });
    it("should setReviewerAddr from owner", async function () {
      await expect(
        this.VRFv2Consumer.connect(this.users.deployer).setReviewerAddr(
          ethers.constants.AddressZero
        )
      ).to.not.be.reverted;
    });

    it("should revert if setReviewerAddr from non-owner", async function () {
      await expect(
        this.VRFv2Consumer.connect(this.users.ashylarry).setReviewerAddr(
          ethers.constants.AddressZero
        )
      ).to.be.reverted;
    });
  });
};

module.exports = {
  shouldDeploy,
};
