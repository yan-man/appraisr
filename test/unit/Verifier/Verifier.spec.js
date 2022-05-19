const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.verifier.owner()).to.equal(this.users.deployer.address);
    });

    it("Should mint default VERIFIER NFTs and send them to owner", async function () {
      const verifier = await this.verifier.VERIFIER();
      expect(
        await this.verifier.balanceOf(this.orgs.wacarnolds.address, verifier)
      ).to.equal(Math.pow(10, 3));
    });
  });
};

const shouldMintVerifierNFT = () => {
  context(`# mintReviewNFT`, async function () {
    describe("...After review1 NFT minted by tybiggums", async function () {
      beforeEach(async function () {
        // this.reviewId = await this.appraiserOrganization.currentReviewId();
        // this.review = {
        //   author: this.users.tybiggums,
        //   rating: 50,
        //   review: "this is a review",
        // };
        // this.tx = await this.appraiserOrganization.mintReviewNFT(
        //   this.review.author,
        //   this.review.rating,
        //   this.review.review
        // );
        // await this.tx.wait();
      });

      //   it("should allow transfers of VERIFIER token only from owner", async function () {
      //     const tx = await this.appraiserOrganization.safeTransferFrom(
      //       this.signers[0].address,
      //       this.signers[1].address,
      //       0, // review Id: VERIFIER
      //       1, // amount of tokens
      //       []
      //     );
      //     await tx.wait();
      //     expect(
      //       await this.appraiserOrganization.balanceOf(this.signers[1].address, 0)
      //     ).to.equal(1);
      //   });
      //   it("should not allow transfers of VERIFIER token from non-owner", async function () {
      //     await expect(
      //       this.appraiserOrganization.safeTransferFrom(
      //         this.signers[1].address,
      //         this.signers[2].address,
      //         0, // review Id: VERIFIER
      //         1, // amount of tokens
      //         []
      //       )
      //     ).to.be.reverted;
      //   });
      describe("...After review1 NFT minted by user1", async () => {
        beforeEach(async function () {
          //   this.tx = await this.appraiserOrganization.safeTransferFrom(
          //     this.signers[0].address,
          //     this.signers[1].address,
          //     0, // review Id: VERIFIER
          //     1, // amount of tokens
          //     []
          //   );
          //   await this.tx.wait();
        });
        it("should mint NFT to user", async function () {});
      });
    });
  });
};

module.exports = { shouldDeploy, shouldMintVerifierNFT };
