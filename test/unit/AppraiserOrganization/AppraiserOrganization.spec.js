const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it(`*Happy Path: Should set the right owner`, async function () {
      expect(await this.appraiserOrganization.owner()).to.equal(
        this.users.deployer.address
      );
    });
    it(`Should set default URI`, async function () {
      expect(await this.appraiserOrganization.uri(0)).to.equal(
        this.constructorParams.URI
      );
    });
  });
};

const shouldMintReviewNFT = () => {
  context(`# mintReviewNFT`, async function () {
    describe(`...After AppraiserOrganization contract is deployed`, async function () {
      describe(`...ashy larry tries to leave a review for Wac Arnolds`, async function () {
        it(`Should throw if rating out of bounds, > 100`, async function () {
          await expect(
            this.appraiserOrganization.mintReviewNFT(
              this.users.ashylarry.address,
              101,
              `this is a review`
            )
          ).to.be.revertedWith(`InvalidRating`);
        });
        it(`Should throw if rating out of bounds, <= 0`, async function () {
          await expect(
            this.appraiserOrganization.mintReviewNFT(
              this.users.ashylarry.address,
              0,
              `this is a review`
            )
          ).to.be.revertedWith(`InvalidRating`);
        });
      });

      describe(`...After ashy larry leaves a non-verified review1 for WacArnolds`, async function () {
        beforeEach(async function () {
          this.reviewId = await this.appraiserOrganization.currentReviewId();
          this.review = {
            author: this.users.ashylarry.address,
            rating: 50,
            review: `this is a review`,
          };
          this.tx = await this.appraiserOrganization.mintReviewNFT(
            this.review.author,
            this.review.rating,
            this.review.review
          );
          await this.tx.wait();
          this.VERIFIER = (await this.verifier.VERIFIER()).toNumber();
        });
        it(`should mint review NFT to ashy larry`, async function () {
          expect(
            await this.appraiserOrganization.balanceOf(
              this.users.ashylarry.address,
              this.reviewId
            )
          ).to.equal(1);
        });
        it(`should update state vars. 'isVerified' should be false`, async function () {
          const { author, rating, review, unixtime, isVerified } =
            await this.appraiserOrganization.s_reviews(this.reviewId);

          expect(author).to.equal(this.review.author);
          expect(rating).to.equal(this.review.rating);
          expect(review).to.equal(this.review.review);
          expect(isVerified).to.equal(false);
          expect(unixtime.toNumber()).to.be.a("number");
        });
        it(`should emit LogNFTReviewMinted event`, async function () {
          await expect(this.tx)
            .to.emit(this.appraiserOrganization, `LogNFTReviewMinted`)
            .withArgs(this.reviewId);
        });
        context(`# Vote on reviews`, async function () {
          describe(`...After review is upvoted by dave`, async () => {
            beforeEach(async function () {
              this.voteOnReviewTx =
                await this.appraiserOrganization.voteOnReview(
                  this.users.dave.address,
                  this.reviewId,
                  true
                );
              await this.voteOnReviewTx.wait();
            });
            // it(`should update state vars - review votes`, async function () {
            //   const voter = await this.appraiserOrganization.s_upvotes(
            //     this.reviewId,
            //     0
            //   );
            //   expect(voter).to.equal(this.users.dave.address);
            // });
            // it(`should return num of upvotes`, async function () {
            //   expect(
            //     await this.appraiserOrganization.getNumVotes(
            //       this.reviewId,
            //       true
            //     )
            //   ).to.equal(1);
            // });
            it(`should emit LogNFTReviewVote event`, async function () {
              await expect(this.voteOnReviewTx)
                .to.emit(this.appraiserOrganization, `LogNFTReviewVote`)
                .withArgs(this.reviewId);
            });
          });

          describe(`...After review is downvoted by dave`, async () => {
            beforeEach(async function () {
              this.voteOnReviewTx =
                await this.appraiserOrganization.voteOnReview(
                  this.users.dave.address,
                  this.reviewId,
                  true
                );
              await this.voteOnReviewTx.wait();
            });
            // it(`should update state vars - review votes`, async function () {
            //   const voter = await this.appraiserOrganization.s_downvotes(
            //     this.reviewId,
            //     0
            //   );
            //   expect(voter).to.equal(this.users.dave.address);
            // });
            // it(`should return num of downvotes`, async function () {
            //   expect(
            //     await this.appraiserOrganization.getNumVotes(
            //       this.reviewId,
            //       false
            //     )
            //   ).to.equal(1);
            // });
            it(`should emit LogNFTReviewVote event`, async function () {
              await expect(this.voteOnReviewTx)
                .to.emit(this.appraiserOrganization, `LogNFTReviewVote`)
                .withArgs(this.reviewId);
            });
          });
        });

        describe(`...After ty biggums leaves a verified review2 for WacArnolds`, async () => {
          beforeEach(async function () {
            await this.mocks.mockVerifier.mock.balanceOf.returns(1);

            this.reviewId = await this.appraiserOrganization.currentReviewId();
            this.review = {
              author: this.users.tybiggums.address,
              rating: 50,
              review: `this is a review`,
            };
            this.tx = await this.appraiserOrganization.mintReviewNFT(
              this.review.author,
              this.review.rating,
              this.review.review
            );
            await this.tx.wait();
          });
          it("should mint NFT to ty biggums", async function () {
            expect(
              await this.appraiserOrganization.balanceOf(
                this.users.tybiggums.address,
                this.reviewId
              )
            ).to.equal(1);
          });
          it(`should update state vars. 'isVerified' should be true`, async function () {
            const { author, rating, review, unixtime, isVerified } =
              await this.appraiserOrganization.s_reviews(this.reviewId);

            expect(author).to.equal(this.review.author);
            expect(rating).to.equal(this.review.rating);
            expect(review).to.equal(this.review.review);
            expect(isVerified).to.equal(true);
            expect(unixtime.toNumber()).to.be.a("number");
          });
          it(`should emit LogNFTReviewMinted event`, async function () {
            await expect(this.tx)
              .to.emit(this.appraiserOrganization, `LogNFTReviewMinted`)
              .withArgs(this.reviewId);
          });
        });
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
