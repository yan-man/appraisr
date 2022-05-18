const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiserOrganization.owner()).to.equal(
        this.signers[0].address
      );
    });
    it("Should set default URI", async function () {
      expect(await this.appraiserOrganization.uri(0)).to.equal(
        this.constructorParams[1]
      );
    });
  });
};

const shouldMintReviewNFT = () => {
  context(`# mintReviewNFT`, async function () {
    it("Should throw if rating > 100", async function () {
      await expect(
        this.appraiserOrganization.mintReviewNFT(
          this.signers[0].address,
          101,
          "this is a review"
        )
      ).to.be.revertedWith(`InvalidRating`);
    });
    it("Should throw if rating <= 0", async function () {
      await expect(
        this.appraiserOrganization.mintReviewNFT(
          this.signers[0].address,
          0,
          "this is a review"
        )
      ).to.be.revertedWith(`InvalidRating`);
    });

    describe("...After review1 NFT minted by user1", async () => {
      beforeEach(async function () {
        this.reviewId = await this.appraiserOrganization.currentReviewId();
        this.review = {
          author: this.signers[1].address,
          rating: 50,
          review: "this is a review",
        };
        this.tx = await this.appraiserOrganization.mintReviewNFT(
          this.review.author,
          this.review.rating,
          this.review.review
        );
        await this.tx.wait();
      });
      it("should mint NFT to user", async function () {
        expect(
          await this.appraiserOrganization.balanceOf(
            this.signers[1].address,
            this.reviewId
          )
        ).to.equal(1);
      });
      it("should update state vars", async function () {
        const { author, rating, review, unixtime } =
          await this.appraiserOrganization.s_reviews(this.reviewId);

        expect(author).to.equal(this.review.author);
        expect(rating).to.equal(this.review.rating);
        expect(review).to.equal(this.review.review);
        expect(unixtime.toNumber()).to.be.a("number");
      });
      it("should emit LogNFTReviewMinted event", async function () {
        await expect(this.tx)
          .to.emit(this.appraiserOrganization, `LogNFTReviewMinted`)
          .withArgs(this.reviewId);
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

// test: first org saved, event emitted
// test: first org saved, initial verifier NFTs minted
// test: first org saved,

// after: first org saved
// test:
// test: NFT not minted if rating is < 0
// test: NFT not minted if rating is > 100
// test: that NFT is minted after review is left

module.exports = {
  shouldDeploy,
  shouldMintReviewNFT,
};
