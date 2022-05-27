const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.VRFv2Consumer.owner()).to.equal(
        this.users.deployer.address
      );
    });
    it.only("should revert on requestRandomWords from non owner", async function () {
      await expect(
        this.VRFv2Consumer.connect(this.users.ashylarry).requestRandomWords(
          0,
          0
        )
      ).to.be.reverted;
    });
    // it.only("should requestRandomWords from owner", async function () {
    //   await this.VRFv2Consumer.setReviewerAddr(
    //     this.users.sampleReviewer.address
    //   );
    //   await this.VRFv2Consumer.connect(
    //     this.users.sampleReviewer
    //   ).requestRandomWords(0, 0);
    //   // await expect(
    //   //   this.VRFv2Consumer.connect(
    //   //     this.users.sampleReviewer
    //   //   ).requestRandomWords(0, 0)
    //   // ).to.be.reverted;
    // });
  });
};

module.exports = {
  shouldDeploy,
  // shouldManageReviews,
  // shouldManageReviewsRatings,
};
