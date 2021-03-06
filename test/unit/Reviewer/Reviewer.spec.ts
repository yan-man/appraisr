import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const shouldDeploy = (): void => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.reviewer.owner()).to.equal(this.users.deployer.address);
    });
    it("should set Approval Organization address", async function () {
      await this.reviewer.setAppraiserOrganizationContractAddress(
        0,
        this.mocks.mockAppraiserOrganization?.address
      );
      expect(await this.reviewer.s_aoContracts(0)).to.equal(
        this.mocks.mockAppraiserOrganization?.address
      );
    });
    it("should not allow set Approval Organization address for non owner", async function () {
      await expect(
        this.reviewer
          .connect(this.users.ashylarry)
          .setAppraiserOrganizationContractAddress(
            0,
            this.mocks.mockAppraiserOrganization?.address
          )
      ).to.be.reverted;
    });
    it("should setVRFv2ConsumerContractAddress", async function () {
      await expect(
        this.reviewer.setVRFv2ConsumerContractAddress(
          this.mocks.mockVRFv2Consumer?.address
        )
      ).to.not.be.reverted;
    });
    it("should not allow setVRFv2ConsumerContractAddress for non owner", async function () {
      await expect(
        this.reviewer
          .connect(this.users.ashylarry)
          .setVRFv2ConsumerContractAddress(
            this.mocks.mockVRFv2Consumer?.address
          )
      ).to.be.reverted;
    });
  });
};

const shouldManageReviews = (): void => {
  context(`# manage reviews`, async function () {
    describe("...After mock contract addresses set", async () => {
      beforeEach(async function () {
        this.WacArnolds = { orgId: 0 };
        await this.reviewer.setAppraiserOrganizationContractAddress(
          this.WacArnolds.orgId,
          this.mocks.mockAppraiserOrganization?.address
        );
        await this.reviewer.setVRFv2ConsumerContractAddress(
          this.mocks.mockVRFv2Consumer?.address
        );
      });
      it(`should revert to mint review for non-valid org`, async function () {
        await expect(
          this.reviewer.mintReview(
            this.WacArnolds.orgId + 100, // made up false orgId
            50,
            "test review"
          )
        ).to.be.revertedWith(`Reviewer__InvalidOrgId`);
      });
      it(`should not revert to mint review for valid org`, async function () {
        await expect(
          this.reviewer
            .connect(this.users.ashylarry)
            .mintReview(this.WacArnolds.orgId, 50, "test review")
        ).to.not.be.reverted;
      });

      context(`# mint review`, async function () {
        describe(`...After review1 minted`, async () => {
          beforeEach(async function () {
            this.mintReviewTx = await this.reviewer
              .connect(this.users.ashylarry)
              .mintReview(this.WacArnolds.orgId, 50, "test review");
            await this.mintReviewTx.wait();

            const receipt = await this.mintReviewTx.wait();
            const eventId = [...receipt.events.keys()].filter(
              (id) => receipt.events[id].event === "LogMintReview"
            );
            const {
              reviewId,
            }: {
              reviewId: BigNumber;
            } = {
              ...receipt.events[eventId[0]].args,
            };
            this.reviewId = reviewId;
          });

          it(`should update s_reviews state var`, async function () {
            expect(
              await this.reviewer.s_reviews(
                this.WacArnolds.orgId,
                this.reviewId
              )
            ).to.equal(this.users.ashylarry.address);
          });

          it(`should create new user when ashylarry's first review is minted at WacArnolds`, async function () {
            const {
              upvotes,
              downvotes,
              isRegistered,
            }: {
              upvotes: BigNumber;
              downvotes: BigNumber;
              isRegistered: Boolean;
            } = await this.reviewer.s_users(this.users.ashylarry.address);
            expect(upvotes).to.equal(ethers.BigNumber.from(0));
            expect(downvotes).to.equal(ethers.BigNumber.from(0));
            expect(isRegistered).to.equal(true);
          });

          it(`should emit LogMintReview event`, async function () {
            await expect(this.mintReviewTx)
              .to.emit(this.reviewer, `LogMintReview`)
              .withArgs(this.mockedResponses.mintReviewNFT);
          });

          it(`should emit LogNewUser event`, async function () {
            await expect(this.mintReviewTx)
              .to.emit(this.reviewer, `LogNewUser`)
              .withArgs(this.users.ashylarry.address);
          });

          it(`should updateReviewGroupId`, async function () {
            await this.reviewer.setVRFv2ConsumerContractAddress(
              this.users.sampleVRFv2Consumer.address
            );
            await expect(
              this.reviewer
                .connect(this.users.sampleVRFv2Consumer)
                .updateReviewGroupId(this.WacArnolds.orgId, this.reviewId, 2)
            ).to.not.be.reverted;
          });

          it(`should revert on updateReviewGroupId as non VRF consumer`, async function () {
            await this.reviewer.setVRFv2ConsumerContractAddress(
              this.users.sampleVRFv2Consumer.address
            );
            await expect(
              this.reviewer
                .connect(this.users.ashylarry)
                .updateReviewGroupId(this.WacArnolds.orgId, this.reviewId, 2)
            ).to.be.reverted;
          });

          it(`should not create a new user if ashylarry leaves 2nd review at WacArnolds`, async function () {
            const tx2 = await this.reviewer
              .connect(this.users.ashylarry)
              .mintReview(this.WacArnolds.orgId, 51, "test review2");
            await expect(tx2).to.not.emit(this.reviewer, `LogNewUser`);
          });

          describe(`...After 2nd org studio54 added`, async function () {
            beforeEach(async function () {
              this.studio54 = { orgId: 1 };
              await this.reviewer.setAppraiserOrganizationContractAddress(
                this.studio54.orgId,
                this.mocks.mockAppraiserOrganization2?.address
              );
            });
            it(`should save new review if existing user ashy larry adds review to org2 studio54`, async function () {
              const tx = await this.reviewer
                .connect(this.users.ashylarry)
                .mintReview(this.studio54.orgId, 54, "test review2");
              const receipt = await tx.wait();
              const eventId: Array<3> = [...receipt.events.keys()].filter(
                (id) => receipt.events[id].event === "LogMintReview"
              );
              const { reviewId }: { reviewId: BigNumber } = {
                ...receipt.events[eventId[0]].args,
              };
              expect(
                await this.reviewer.s_reviews(this.studio54.orgId, reviewId)
              ).to.equal(this.users.ashylarry.address);
            });
            it(`should not emit LogNewUser event if existing user ashy larry adds review to org2 studio54`, async function () {
              const tx = await this.reviewer
                .connect(this.users.ashylarry)
                .mintReview(this.WacArnolds.orgId, 50, "test review");
              await tx.wait();
              const tx2 = await this.reviewer
                .connect(this.users.ashylarry)
                .mintReview(this.studio54.orgId, 54, "test review2");
              const receipt2 = await tx2.wait();
              await expect(tx2).to.not.emit(this.reviewer, `LogNewUser`);
            });
          });
        });
      });
    });
  });
};

const shouldManageReviewsRatings = () => {
  context(`# manage reviews`, async function () {
    describe("...After org1 WacArnolds saved & ashylarry's review1 is minted", async () => {
      beforeEach(async function () {
        this.WacArnolds = { orgId: 0 };
        await this.reviewer.setAppraiserOrganizationContractAddress(
          this.WacArnolds.orgId,
          this.mocks.mockAppraiserOrganization?.address
        );
        await this.reviewer.setVRFv2ConsumerContractAddress(
          this.mocks.mockVRFv2Consumer?.address
        );

        const mintReviewTx = await this.reviewer
          .connect(this.users.ashylarry)
          .mintReview(this.WacArnolds.orgId, 50, "test review");
        await mintReviewTx.wait();
      });

      it(`should revert if org doesn't exist`, async function () {
        await expect(
          this.reviewer.connect(this.users.tybiggums).voteOnReview(5, 5, true)
        ).to.be.revertedWith(`Reviewer__InvalidOrgId`);
      });

      it(`should revert if review doesn't exist`, async function () {
        await expect(
          this.reviewer
            .connect(this.users.tybiggums)
            .voteOnReview(this.WacArnolds.orgId, 5, true)
        ).to.be.revertedWith(`Reviewer__InvalidReview`);
      });

      it(`should revert if ashylarry tries to upvote own review`, async function () {
        await expect(
          this.reviewer
            .connect(this.users.ashylarry)
            .voteOnReview(
              this.WacArnolds.orgId,
              this.mockedResponses.mintReviewNFT,
              true
            )
        ).to.be.revertedWith(`Reviewer__VoterMatchesAuthor`);
      });

      it(`should revert if ashylarry tries to downvote own review`, async function () {
        await expect(
          this.reviewer
            .connect(this.users.ashylarry)
            .voteOnReview(
              this.WacArnolds.orgId,
              this.mockedResponses.mintReviewNFT,
              true
            )
        ).to.be.revertedWith(`Reviewer__VoterMatchesAuthor`);
      });

      it(`should update ashylarry's upvotes when tybiggums upvotes ashylarry's review`, async function () {
        const tx2 = await this.reviewer
          .connect(this.users.tybiggums)
          .voteOnReview(
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT,
            true
          );
        await tx2.wait();

        const { upvotes, downvotes } = await this.reviewer.s_users(
          this.users.ashylarry.address
        );
        expect(upvotes).to.equal(ethers.BigNumber.from(1));
        expect(downvotes).to.equal(ethers.BigNumber.from(0));
      });

      it(`should emit event when tybiggums upvotes ashylarry's review`, async function () {
        const tx = await this.reviewer
          .connect(this.users.tybiggums)
          .voteOnReview(
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT,
            true
          );

        await expect(tx)
          .to.emit(this.reviewer, `LogVoteOnReview`)
          .withArgs(
            this.users.tybiggums.address,
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT
          );
      });

      it(`should update ashylarry downvotes when tybiggums downvotes ashylarry's review`, async function () {
        const tx2 = await this.reviewer
          .connect(this.users.tybiggums)
          .voteOnReview(
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT,
            false
          );
        await tx2.wait();

        const { upvotes, downvotes } = await this.reviewer.s_users(
          this.users.ashylarry.address
        );

        expect(upvotes).to.equal(ethers.BigNumber.from(0));
        expect(downvotes).to.equal(ethers.BigNumber.from(1));
      });

      it(`should emit event when tybiggums downvotes ashylarry's review`, async function () {
        const tx = await this.reviewer
          .connect(this.users.tybiggums)
          .voteOnReview(
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT,
            false
          );

        await expect(tx)
          .to.emit(this.reviewer, `LogVoteOnReview`)
          .withArgs(
            this.users.tybiggums.address,
            this.WacArnolds.orgId,
            this.mockedResponses.mintReviewNFT
          );
      });
    });
  });
};

export default {
  shouldDeploy,
  shouldManageReviews,
  shouldManageReviewsRatings,
};
