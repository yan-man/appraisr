const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiser.owner()).to.equal(this.signers[0].address);
    });
  });
};

const shouldManageOrgs = () => {
  context(`# manage organizations`, async function () {
    describe("...save new orgs", async () => {
      beforeEach(`save new org`, async function () {
        this.tx = await this.appraiser.addOrganization(
          this.companies[0].name,
          this.companies[0].addr,
          this.companies[0].URI
        );
        this.receipt = await this.tx.wait();
      });

      it(`Should update state vars after saving new organization`, async function () {
        const { orgId, name, addr } = await this.appraiser.s_organizations(0);
        expect(orgId).to.equal(ethers.BigNumber.from(0));
        expect(name).to.equal(this.companies[0].name);
        expect(addr).to.equal(this.companies[0].addr);
      });

      it(`Should emit events when new organization saved`, async function () {
        const { orgId } = await this.appraiser.s_organizations(0);

        // events emitted
        await expect(this.tx)
          .to.emit(this.appraiser, `LogAddOrganization`)
          .withArgs(orgId);
        await expect(this.tx).to.emit(this.appraiser, `LogNFTContractDeployed`);
        await expect(this.tx).to.emit(
          this.appraiser,
          `LogVerifierNFTContractDeployed`
        );

        eventId = [...this.receipt.events.keys()].filter(
          (id) => this.receipt.events[id].event === "LogAddOrganization"
        );
        const { orgId: eventOrgId } = {
          ...this.receipt.events[eventId[0]].args,
        };
        expect(eventOrgId).to.equal(ethers.BigNumber.from(0));

        eventId = [...this.receipt.events.keys()].filter(
          (id) => this.receipt.events[id].event === "OwnershipTransferred"
        );
        expect(eventId).to.have.lengthOf(2);
        const { newOwner } = { ...this.receipt.events[eventId[0]].args };
        expect(newOwner).to.equal(this.appraiser.address);
      });

      describe(`...After new org saved`, async () => {
        beforeEach(async function () {
          eventId = [...this.receipt.events.keys()].filter(
            (id) => this.receipt.events[id].event === "LogNFTContractDeployed"
          )[0];
          this.eventArgs = { ...this.receipt.events[eventId].args };
        });
        it(`should return current org id`, async function () {
          expect(await this.appraiser.currentOrgId()).to.equal(
            ethers.BigNumber.from(1)
          );
        });
        it(`should return current number of orgs`, async function () {
          expect(await this.appraiser.numberOrganizations()).to.equal(
            ethers.BigNumber.from(1)
          );
        });
        it(`should return deployed contract address`, async function () {
          expect(await this.appraiser.s_aoContracts(0)).to.equal(
            this.eventArgs.aoContractAddress
          );
        });
        it(`Should throw DuplicateOrgName error on duplicate org name`, async function () {
          await expect(
            this.appraiser.addOrganization(
              this.companies[0].name,
              this.companies[0].addr,
              this.companies[0].URI
            )
          ).to.be.revertedWith(`DuplicateOrgName`);
        });
        it(`Should throw DuplicateOrgAddr error on duplicate org addr`, async function () {
          await expect(
            this.appraiser.addOrganization(
              `${this.companies[0].name}1`,
              this.companies[0].addr,
              this.companies[0].URI
            )
          ).to.be.revertedWith(`DuplicateOrgAddr`);
        });

        it(`should save second org`, async function () {
          const tx = await this.appraiser.addOrganization(
            this.companies[1].name,
            this.companies[1].addr,
            this.companies[1].URI
          );
          const receipt = await tx.wait();
          const eventId = [...receipt.events.keys()].filter(
            (id) => receipt.events[id].event === "LogAddOrganization"
          );
          const { orgId, name, addr } = await this.appraiser.s_organizations(1);

          expect(orgId).to.equal(
            ethers.BigNumber.from(this.companies[1].orgId)
          );
          expect(name).to.equal(this.companies[1].name);
          expect(addr).to.equal(this.companies[1].addr);
        });

        it(`should emit events after second org saved`, async function () {
          const tx = await this.appraiser.addOrganization(
            this.companies[1].name,
            this.companies[1].addr,
            this.companies[1].URI
          );
          const receipt = await tx.wait();

          await expect(tx)
            .to.emit(this.appraiser, `LogAddOrganization`)
            .withArgs(1);
          await expect(tx).to.emit(this.appraiser, `LogNFTContractDeployed`);
        });
      });
    });
  });
};

const shouldManageReviews = () => {
  context(`# manage reviews`, async function () {
    describe("...After new org exists", async () => {
      beforeEach(async function () {
        this.tx = await this.appraiser.addOrganization(
          this.companies[0].name,
          this.companies[0].addr,
          this.companies[0].URI
        );
        this.receipt = await this.tx.wait();
        const eventId = [...this.receipt.events.keys()].filter(
          (id) => this.receipt.events[id].event === "LogAddOrganization"
        );
        const { orgId } = {
          ...this.receipt.events[eventId[0]].args,
        };
        this.orgId = orgId;
      });
      it(`should revert to mint review for non-valid org`, async function () {
        await expect(
          this.appraiser.mintReview(
            this.orgId.toNumber() + 100,
            50,
            "test review"
          )
        ).to.be.revertedWith(`InvalidOrgId`);
      });

      it(`should revert to set AppraiserOrganization contract address for non-valid org`, async function () {
        await expect(
          this.appraiser.setAOContractAddress(
            this.orgId.toNumber() + 100,
            this.mocks.mockAppraiserOrganization.address
          )
        ).to.be.revertedWith(`InvalidOrgId`);
      });

      it(`should set AppraiserOrganization contract address for valid org`, async function () {
        const tx = await this.appraiser.setAOContractAddress(
          this.orgId.toNumber(),
          this.mocks.mockAppraiserOrganization.address
        );
        await tx.wait();
        expect(await this.appraiser.s_aoContracts(0)).to.equal(
          this.mocks.mockAppraiserOrganization.address
        );
      });

      context(`# mint review`, async function () {
        describe(`...After mock AO contract set & first review minted`, async () => {
          beforeEach(async function () {
            this.mockedResponses = {
              mintReviewNFT: 100,
            };
            await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
              this.mockedResponses.mintReviewNFT
            );

            const tx = await this.appraiser.setAOContractAddress(
              this.orgId.toNumber(),
              this.mocks.mockAppraiserOrganization.address
            );
            await tx.wait();

            this.mintReviewTx = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              50,
              "test review"
            );
            await this.mintReviewTx.wait();
          });

          it(`should update s_reviews state var`, async function () {
            expect(
              await this.appraiser.s_reviews(
                0,
                this.mockedResponses.mintReviewNFT
              )
            ).to.equal(this.signers[0].address);
          });

          it(`should create new user when user1's first review is minted`, async function () {
            const { upvotes, downvotes, isRegistered } =
              await this.appraiser.users(this.signers[0].address);
            expect(upvotes).to.equal(ethers.BigNumber.from(0));
            expect(downvotes).to.equal(ethers.BigNumber.from(0));
            expect(isRegistered).to.equal(true);
          });

          it(`should emit LogMintReview event`, async function () {
            await expect(this.mintReviewTx)
              .to.emit(this.appraiser, `LogMintReview`)
              .withArgs(this.mockedResponses.mintReviewNFT);
          });

          it(`should emit LogNewUser event`, async function () {
            await expect(this.mintReviewTx)
              .to.emit(this.appraiser, `LogNewUser`)
              .withArgs(this.signers[0].address);
          });

          it(`should not create a new user if user leaves 2nd review at org1`, async function () {
            const tx2 = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              51,
              "test review2"
            );
            await expect(tx2).to.not.emit(this.appraiser, `LogNewUser`);
          });

          describe(`...After 2nd org added`, async function () {
            beforeEach(async function () {
              const tx = await this.appraiser.addOrganization(
                this.companies[1].name,
                this.companies[1].addr,
                this.companies[1].URI
              );
              const receipt = await tx.wait();
              const eventId = [...receipt.events.keys()].filter(
                (id) => receipt.events[id].event === "LogAddOrganization"
              );
              const { orgId } = {
                ...receipt.events[eventId[0]].args,
              };

              this.orgId2 = orgId;
            });
            it(`should save new review if existing user1 adds review to org2`, async function () {
              const tx = await this.appraiser.mintReview(
                this.orgId.toNumber(),
                50,
                "test review"
              );
              await tx.wait();
              const tx2 = await this.appraiser.mintReview(
                this.orgId2.toNumber(),
                54,
                "test review2"
              );
              await expect(tx2).to.not.emit(this.appraiser, `LogNewUser`);
            });
            it(`should not emit LogNewUser event if existing user1 adds review to org2`, async function () {
              const tx = await this.appraiser.mintReview(
                this.orgId.toNumber(),
                50,
                "test review"
              );
              await tx.wait();
              const tx2 = await this.appraiser.mintReview(
                this.orgId2.toNumber(),
                54,
                "test review2"
              );
              await tx2.wait();
              await expect(tx2).to.not.emit(this.appraiser, `LogNewUser`);
            });
          });
        });
      });
    });
  });
};

const shouldManageReviewsRatings = () => {
  context(`# manage reviews`, async function () {
    describe("...After 1st org saved & review1 is minted", async () => {
      beforeEach(async function () {
        this.tx = await this.appraiser.addOrganization(
          this.companies[0].name,
          this.companies[0].addr,
          this.companies[0].URI
        );
        this.receipt = await this.tx.wait();
        const eventId = [...this.receipt.events.keys()].filter(
          (id) => this.receipt.events[id].event === "LogAddOrganization"
        );
        const { orgId } = {
          ...this.receipt.events[eventId[0]].args,
        };
        this.orgId = orgId;
        this.mockedResponses = {
          mintReviewNFT: 100,
          voteOnReview: 2,
        };
        await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
          this.mockedResponses.mintReviewNFT
        );
        await this.mocks.mockAppraiserOrganization.mock.voteOnReview.returns(
          this.mockedResponses.voteOnReview
        );
        const tx = await this.appraiser.setAOContractAddress(
          this.orgId.toNumber(),
          this.mocks.mockAppraiserOrganization.address
        );
        await tx.wait();

        const mintReviewtx = await this.appraiser.mintReview(
          this.orgId.toNumber(),
          50,
          "test review"
        );
        await mintReviewtx.wait();
      });

      it(`should revert if org doesn't exist`, async function () {
        await expect(
          this.appraiser.connect(this.signers[1]).voteOnReview(5, 5, true)
        ).to.be.revertedWith(`InvalidOrgId`);
      });

      it(`should revert if review doesn't exist`, async function () {
        await expect(
          this.appraiser
            .connect(this.signers[1])
            .voteOnReview(this.orgId, 5, true)
        ).to.be.revertedWith(`InvalidReview`);
      });

      it(`should revert if user tries to upvote own review`, async function () {
        await expect(
          this.appraiser.voteOnReview(
            this.orgId,
            this.mockedResponses.mintReviewNFT,
            true
          )
        ).to.be.revertedWith(`ReviewerMatchesAuthor`);
      });

      it(`should revert if user tries to downvote own review`, async function () {
        await expect(
          this.appraiser.voteOnReview(
            this.orgId,
            this.mockedResponses.mintReviewNFT,
            true
          )
        ).to.be.revertedWith(`ReviewerMatchesAuthor`);
      });

      it(`should update user1 upvotes when user2 upvotes user1's review`, async function () {
        const tx2 = await this.appraiser
          .connect(this.signers[1])
          .voteOnReview(this.orgId, this.mockedResponses.mintReviewNFT, true);
        await tx2.wait();

        const { upvotes, downvotes } = await this.appraiser.users(
          this.signers[0].address
        );

        expect(upvotes).to.equal(ethers.BigNumber.from(1));
        expect(downvotes).to.equal(ethers.BigNumber.from(0));
      });

      it(`should emit event when user2 upvotes user1's review`, async function () {
        const tx = await this.appraiser
          .connect(this.signers[1])
          .voteOnReview(this.orgId, this.mockedResponses.mintReviewNFT, true);

        await expect(tx)
          .to.emit(this.appraiser, `LogVoteOnReview`)
          .withArgs(
            this.signers[1].address,
            this.orgId,
            this.mockedResponses.mintReviewNFT
          );
      });

      it(`should update user1 downvotes when user2 downvotes user1's review`, async function () {
        const tx2 = await this.appraiser
          .connect(this.signers[1])
          .voteOnReview(this.orgId, this.mockedResponses.mintReviewNFT, false);
        await tx2.wait();

        const { upvotes, downvotes } = await this.appraiser.users(
          this.signers[0].address
        );

        expect(upvotes).to.equal(ethers.BigNumber.from(0));
        expect(downvotes).to.equal(ethers.BigNumber.from(1));
      });

      it(`should emit event when user2 downvotes user1's review`, async function () {
        const tx = await this.appraiser
          .connect(this.signers[1])
          .voteOnReview(this.orgId, this.mockedResponses.mintReviewNFT, false);

        await expect(tx)
          .to.emit(this.appraiser, `LogVoteOnReview`)
          .withArgs(
            this.signers[1].address,
            this.orgId,
            this.mockedResponses.mintReviewNFT
          );
      });
    });
  });
};

module.exports = {
  shouldDeploy,
  shouldManageOrgs,
  shouldManageReviews,
  shouldManageReviewsRatings,
};
