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
      expect(
        await this.appraiserOrganization.uri(this.constructorParams.orgId)
      ).to.equal(this.constructorParams.URI);
    });
    it(`Should update state vars after saving new organization WacArnolds`, async function () {
      const org = await this.appraiserOrganization.organization();
      expect(org.orgId).to.equal(this.constructorParams.orgId);
      expect(org.name).to.equal(this.constructorParams.name);
      expect(org.addr).to.equal(this.constructorParams.addr);
      expect(org.isActive).to.equal(true);
      expect(org.isCreated).to.equal(true);
    });
  });
};

const shouldMintReviewNFT = () => {
  context(`# mintReviewNFT`, async function () {
    describe(`...After AppraiserOrganization contract is deployed`, async function () {
      describe(`...ashy larry tries to leave a non-verified review1 for WacArnolds`, async function () {
        it(`Should throw if rating out of bounds, > 100`, async function () {
          await expect(
            this.appraiserOrganization.mintReviewNFT(
              this.users.ashylarry.address,
              101,
              `this is a review`
            )
          ).to.be.revertedWith(`AppraiserOrganization__InvalidRating`);
        });
        it(`Should throw if rating out of bounds, <= 0`, async function () {
          await expect(
            this.appraiserOrganization.mintReviewNFT(
              this.users.ashylarry.address,
              0,
              `this is a review`
            )
          ).to.be.revertedWith(`AppraiserOrganization__InvalidRating`);
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
      });
    });
  });
};

const shouldVoteOnReviewNFT = () => {
  context(`# voteOnReviewNFT`, async function () {
    describe(`...After AppraiserOrganization contract is deployed`, async function () {
      describe(`...After ashy larry leaves a non-verified review1 for WacArnolds`, async function () {
        beforeEach(async function () {
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
          this.receipt = await this.tx.wait();
          this.VERIFIER = (await this.verifier.VERIFIER()).toNumber();

          const eventId = [...this.receipt.events.keys()].filter(
            (id) => this.receipt.events[id].event === "LogNFTReviewMinted"
          );
          const { reviewId } = {
            ...this.receipt.events[eventId[0]].args,
          };
          this.reviewId = reviewId;
        });
        it(`should not allow ashy larry to upvote own review`, async function () {
          await expect(
            this.appraiserOrganization.voteOnReview(
              this.users.ashylarry.address,
              this.reviewId,
              true
            )
          ).to.be.revertedWith(`AppraiserOrganization__CannotVoteOnOwnReview`);
        });

        describe(`...After review1 is upvoted by dave`, async () => {
          beforeEach(async function () {
            this.isUpvote = true;
            this.voteOnReviewTx = await this.appraiserOrganization.voteOnReview(
              this.users.dave.address,
              this.reviewId,
              this.isUpvote
            );
            await this.voteOnReviewTx.wait();
          });
          it(`should update state vars - votes`, async function () {
            expect(
              await this.appraiserOrganization.hasVoted(
                this.users.dave.address,
                this.reviewId,
                this.isUpvote
              )
            ).to.equal(true);
          });
          it(`should return correct number of votes`, async function () {
            expect(
              await this.appraiserOrganization.s_upvoteCount(this.reviewId)
            ).to.equal(1);
            expect(
              await this.appraiserOrganization.s_downvoteCount(this.reviewId)
            ).to.equal(0);
          });
          it(`should emit LogNFTReviewVote event`, async function () {
            await expect(this.voteOnReviewTx)
              .to.emit(this.appraiserOrganization, `LogNFTReviewVote`)
              .withArgs(this.reviewId);
          });
          it(`should revert if multiple upvotes given by dave for same review`, async function () {
            await expect(
              this.appraiserOrganization.voteOnReview(
                this.users.dave.address,
                this.reviewId,
                this.isUpvote
              )
            ).to.be.revertedWith(
              `AppraiserOrganization__OneVoteAllowedPerReview`
            );
          });

          it(`should revert if multiple votes given by dave for same review`, async function () {
            await expect(
              this.appraiserOrganization.voteOnReview(
                this.users.dave.address,
                this.reviewId,
                !this.isUpvote
              )
            ).to.be.revertedWith(
              `AppraiserOrganization__OneVoteAllowedPerReview`
            );
          });

          describe(`...After review1 is downvoted by rick james`, async () => {
            beforeEach(async function () {
              this.isUpvote = false;
              this.voteOnReviewTx =
                await this.appraiserOrganization.voteOnReview(
                  this.users.rickjames.address,
                  this.reviewId,
                  this.isUpvote
                );
              await this.voteOnReviewTx.wait();
            });
            it(`should update state vars - review votes`, async function () {
              expect(
                await this.appraiserOrganization.hasVoted(
                  this.users.rickjames.address,
                  this.reviewId,
                  this.isUpvote
                )
              ).to.equal(true);
            });
            it(`should return correct number of votes`, async function () {
              expect(
                await this.appraiserOrganization.s_upvoteCount(this.reviewId)
              ).to.equal(1);
              expect(
                await this.appraiserOrganization.s_downvoteCount(this.reviewId)
              ).to.equal(1);
            });
            it(`should emit LogNFTReviewVote event`, async function () {
              await expect(this.voteOnReviewTx)
                .to.emit(this.appraiserOrganization, `LogNFTReviewVote`)
                .withArgs(this.reviewId);
            });
            it(`should revert if multiple downvotes given by rickjames for same review`, async function () {
              await expect(
                this.appraiserOrganization.voteOnReview(
                  this.users.rickjames.address,
                  this.reviewId,
                  this.isUpvote
                )
              ).to.be.revertedWith(
                `AppraiserOrganization__OneVoteAllowedPerReview`
              );
            });

            describe(`...After prince leaves a verified review2 for WacArnolds`, async () => {
              beforeEach(async function () {
                await this.mocks.mockVerifier.mock.balanceOf.returns(1);

                this.reviewId =
                  await this.appraiserOrganization.currentReviewId();
                this.review = {
                  author: this.users.prince.address,
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
              it("should mint review NFT to prince", async function () {
                expect(
                  await this.appraiserOrganization.balanceOf(
                    this.users.prince.address,
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
    });
  });
};

// transfer an unverified review
// transfer a verified review

// test certain functions called

module.exports = {
  shouldDeploy,
  shouldMintReviewNFT,
  shouldVoteOnReviewNFT,
};
