import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const shouldManageOrgs = (): void => {
  context(`# manage organizations`, async function () {
    describe("...After Appraiser and Reviewer contracts deployed", async () => {
      beforeEach(`Transfer ownership`, async function () {
        await this.reviewer
          .connect(this.users.deployer)
          .transferOwnership(this.appraiser.address);
      });

      it(`Should not revert when addOrganization`, async function () {
        await expect(
          this.appraiser
            .connect(this.users.deployer)
            .addOrganization(
              this.orgs.WacArnolds.name,
              this.orgs.WacArnolds.addr,
              this.orgs.WacArnolds.URI
            )
        ).to.not.be.reverted;
      });

      it(`Should emit event when addOrganization`, async function () {
        const tx = await this.appraiser
          .connect(this.users.deployer)
          .addOrganization(
            this.orgs.WacArnolds.name,
            this.orgs.WacArnolds.addr,
            this.orgs.WacArnolds.URI
          );

        await expect(tx).to.emit(this.appraiser, `LogAddOrganization`);
      });

      it(`Should update 's_deployedContracts' var -  when 'addOrganization'`, async function () {
        const tx = await this.appraiser
          .connect(this.users.deployer)
          .addOrganization(
            this.orgs.WacArnolds.name,
            this.orgs.WacArnolds.addr,
            this.orgs.WacArnolds.URI
          );

        const receipt = await tx.wait();
        const eventId = [...receipt.events!.keys()].filter(
          (id) => receipt.events![id].event === "LogAddOrganization"
        );
        const emittedOrgId = {
          ...receipt.events![eventId[0]].args,
        };

        expect(
          await this.appraiser
            .connect(this.users.deployer)
            .s_organizations(emittedOrgId.orgId)
        ).to.equal(1);
      });

      describe("...After org1 WacArnolds saved", async () => {
        beforeEach(`Transfer ownership`, async function () {
          this.tx = await this.appraiser
            .connect(this.users.deployer)
            .addOrganization(
              this.orgs.WacArnolds.name,
              this.orgs.WacArnolds.addr,
              this.orgs.WacArnolds.URI
            );

          this.receipt = await this.tx.wait();
          this.eventId = [...this.receipt.events.keys()].filter(
            (id) => this.receipt.events[id].event === "LogAddOrganization"
          );
          const { orgId: emittedOrgId }: { orgId: BigNumber } = {
            ...this.receipt.events[this.eventId[0]].args,
          };

          this.deployedContracts = await this.appraiser
            .connect(this.users.deployer)
            .s_deployedContracts(emittedOrgId);

          const AppraiserOrganization = await ethers.getContractFactory(
            `AppraiserOrganization`
          );
          this.appraiserrOrganization = await AppraiserOrganization.attach(
            this.deployedContracts.AppraiserOrganization
          );

          const Verifier = await ethers.getContractFactory(`Verifier`);
          this.verifier = await Verifier.attach(
            this.deployedContracts.Verifier
          );
        });

        it(`Should mint 1000 initial Verifier NFTs to WacArnolds`, async function () {
          const VERIFIER = await this.verifier.VERIFIER();
          expect(
            await this.verifier.balanceOf(this.orgs.WacArnolds.addr, VERIFIER)
          ).to.equal(1000);
        });

        // test setAppraiserOrganizationContractAddress
        // test balanceOf

        // mintReviewNFT
        // voteOnReview
      });
    });
  });
};

const shouldManageReviews = (): void => {
  // context(`# manage reviews`, async function () {
  //   describe("...After org2 studio54 exists", async () => {
  //     beforeEach(async function () {
  //       this.tx = await this.appraiser.addOrganization(
  //         this.orgs.WacArnolds.name,
  //         this.orgs.WacArnolds.addr,
  //         this.orgs.WacArnolds.URI
  //       );
  //       this.receipt = await this.tx.wait();
  //       const eventId = [...this.receipt.events.keys()].filter(
  //         (id) => this.receipt.events[id].event === "LogAddOrganization"
  //       );
  //       this.WacArnolds = {
  //         ...this.receipt.events[eventId[0]].args,
  //       };
  //     });
  //     it(`should revert to mint review for non-valid org`, async function () {
  //       await expect(
  //         this.appraiser.mintReview(
  //           this.WacArnolds.orgId.toNumber() + 100, // made up false orgId
  //           50,
  //           "test review"
  //         )
  //       ).to.be.revertedWith(`Appraiser__InvalidOrgId`);
  //     });
  //     it(`should revert to set AppraiserOrganization contract address for non-valid org`, async function () {
  //       await expect(
  //         this.appraiser.setAOContractAddress(
  //           this.WacArnolds.orgId.toNumber() + 100, // made up false orgId
  //           this.mocks.mockAppraiserOrganization.address
  //         )
  //       ).to.be.revertedWith(`Appraiser__InvalidOrgId`);
  //     });
  //     it(`should set AppraiserOrganization contract address for org2 studio54`, async function () {
  //       const tx = await this.appraiser.setAOContractAddress(
  //         this.WacArnolds.orgId.toNumber(),
  //         this.mocks.mockAppraiserOrganization.address
  //       );
  //       await tx.wait();
  //       expect(await this.appraiser.s_aoContracts(0)).to.equal(
  //         this.mocks.mockAppraiserOrganization.address
  //       );
  //     });
  //     context(`# mint review`, async function () {
  //       describe(`...After mock AO contract set & review1 minted`, async () => {
  //         beforeEach(async function () {
  //           this.mockedResponses = {
  //             mintReviewNFT: 100,
  //           };
  //           await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
  //             this.mockedResponses.mintReviewNFT
  //           );
  //           const tx = await this.appraiser.setAOContractAddress(
  //             this.WacArnolds.orgId.toNumber(),
  //             this.mocks.mockAppraiserOrganization.address
  //           );
  //           await tx.wait();
  //           this.mintReviewTx = await this.appraiser
  //             .connect(this.users.ashylarry)
  //             .mintReview(this.WacArnolds.orgId.toNumber(), 50, "test review");
  //           await this.mintReviewTx.wait();
  //         });
  //         it(`should update s_reviews state var`, async function () {
  //           expect(
  //             await this.appraiser.s_reviews(
  //               0,
  //               this.mockedResponses.mintReviewNFT
  //             )
  //           ).to.equal(this.users.ashylarry.address);
  //         });
  //         it(`should create new user when ashylarry's first review is minted`, async function () {
  //           const { upvotes, downvotes, isRegistered } =
  //             await this.appraiser.s_users(this.users.ashylarry.address);
  //           expect(upvotes).to.equal(ethers.BigNumber.from(0));
  //           expect(downvotes).to.equal(ethers.BigNumber.from(0));
  //           expect(isRegistered).to.equal(true);
  //         });
  //         it(`should emit LogMintReview event`, async function () {
  //           await expect(this.mintReviewTx)
  //             .to.emit(this.appraiser, `LogMintReview`)
  //             .withArgs(this.mockedResponses.mintReviewNFT);
  //         });
  //         it(`should emit LogNewUser event`, async function () {
  //           await expect(this.mintReviewTx)
  //             .to.emit(this.appraiser, `LogNewUser`)
  //             .withArgs(this.users.ashylarry.address);
  //         });
  //         it(`should not create a new user if ashylarry leaves 2nd review at WacArnolds`, async function () {
  //           const tx2 = await this.appraiser
  //             .connect(this.users.ashylarry)
  //             .mintReview(this.WacArnolds.orgId.toNumber(), 51, "test review2");
  //           await expect(tx2).to.not.emit(this.appraiser, `LogNewUser`);
  //         });
  //         describe(`...After 2nd org studio54 added`, async function () {
  //           beforeEach(async function () {
  //             const tx = await this.appraiser.addOrganization(
  //               this.orgs.studio54.name,
  //               this.orgs.studio54.addr,
  //               this.orgs.studio54.URI
  //             );
  //             const receipt = await tx.wait();
  //             const eventId = [...receipt.events.keys()].filter(
  //               (id) => receipt.events[id].event === "LogAddOrganization"
  //             );
  //             this.studio54 = {
  //               ...receipt.events[eventId[0]].args,
  //             };
  //             const tx2 = await this.appraiser.setAOContractAddress(
  //               this.studio54.orgId.toNumber(),
  //               this.mocks.mockAppraiserOrganization.address
  //             );
  //             await tx2.wait();
  //           });
  //           it(`should save new review if existing user ashy larry adds review to org2 studio54`, async function () {
  //             const tx = await this.appraiser
  //               .connect(this.users.ashylarry)
  //               .mintReview(
  //                 this.WacArnolds.orgId.toNumber(),
  //                 50,
  //                 "test review"
  //               );
  //             await tx.wait();
  //             const tx2 = await this.appraiser
  //               .connect(this.users.ashylarry)
  //               .mintReview(this.studio54.orgId.toNumber(), 54, "test review2");
  //             const receipt2 = await tx2.wait();
  //             expect(
  //               await this.appraiser.s_reviews(
  //                 this.studio54.orgId.toNumber(),
  //                 this.mockedResponses.mintReviewNFT
  //               )
  //             ).to.equal(this.users.ashylarry.address);
  //           });
  //           it(`should not emit LogNewUser event if existing user1 adds review to org2`, async function () {
  //             const tx = await this.appraiser
  //               .connect(this.users.ashylarry)
  //               .mintReview(
  //                 this.WacArnolds.orgId.toNumber(),
  //                 50,
  //                 "test review"
  //               );
  //             await tx.wait();
  //             const tx2 = await this.appraiser
  //               .connect(this.users.ashylarry)
  //               .mintReview(this.studio54.orgId.toNumber(), 54, "test review2");
  //             const receipt2 = await tx2.wait();
  //             await expect(tx2).to.not.emit(this.appraiser, `LogNewUser`);
  //           });
  //         });
  //       });
  //     });
  //   });
  // });
};

const shouldManageReviewsRatings = (): void => {
  // context(`# manage reviews`, async function () {
  //   describe("...After org1 WacArnolds saved & ashylarry's review1 is minted", async () => {
  //     beforeEach(async function () {
  //       this.tx = await this.appraiser.addOrganization(
  //         this.orgs.WacArnolds.name,
  //         this.orgs.WacArnolds.addr,
  //         this.orgs.WacArnolds.URI
  //       );
  //       this.receipt = await this.tx.wait();
  //       const eventId = [...this.receipt.events.keys()].filter(
  //         (id) => this.receipt.events[id].event === "LogAddOrganization"
  //       );
  //       const { orgId } = {
  //         ...this.receipt.events[eventId[0]].args,
  //       };
  //       this.WacArnolds = { orgId };
  //       this.mockedResponses = {
  //         mintReviewNFT: 100,
  //       };
  //       await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
  //         this.mockedResponses.mintReviewNFT
  //       );
  //       await this.mocks.mockAppraiserOrganization.mock.voteOnReview.returns();
  //       const tx = await this.appraiser.setAOContractAddress(
  //         this.WacArnolds.orgId.toNumber(),
  //         this.mocks.mockAppraiserOrganization.address
  //       );
  //       await tx.wait();
  //       const mintReviewtx = await this.appraiser
  //         .connect(this.users.ashylarry)
  //         .mintReview(this.WacArnolds.orgId.toNumber(), 50, "test review");
  //       await mintReviewtx.wait();
  //     });
  //     it(`should revert if org doesn't exist`, async function () {
  //       await expect(
  //         this.appraiser.connect(this.users.tybiggums).voteOnReview(5, 5, true)
  //       ).to.be.revertedWith(`Appraiser__InvalidOrgId`);
  //     });
  //     it(`should revert if review doesn't exist`, async function () {
  //       await expect(
  //         this.appraiser
  //           .connect(this.users.tybiggums)
  //           .voteOnReview(this.WacArnolds.orgId, 5, true)
  //       ).to.be.revertedWith(`Appraiser__InvalidReview`);
  //     });
  //     it(`should revert if ashylarry tries to upvote own review`, async function () {
  //       await expect(
  //         this.appraiser
  //           .connect(this.users.ashylarry)
  //           .voteOnReview(
  //             this.WacArnolds.orgId,
  //             this.mockedResponses.mintReviewNFT,
  //             true
  //           )
  //       ).to.be.revertedWith(`Appraiser__VoterMatchesAuthor`);
  //     });
  //     it(`should revert if ashylarry tries to downvote own review`, async function () {
  //       await expect(
  //         this.appraiser
  //           .connect(this.users.ashylarry)
  //           .voteOnReview(
  //             this.WacArnolds.orgId,
  //             this.mockedResponses.mintReviewNFT,
  //             true
  //           )
  //       ).to.be.revertedWith(`Appraiser__VoterMatchesAuthor`);
  //     });
  //     it(`should update ashylarry's upvotes when tybiggums upvotes ashylarry's review`, async function () {
  //       const tx2 = await this.appraiser
  //         .connect(this.users.tybiggums)
  //         .voteOnReview(
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT,
  //           true
  //         );
  //       await tx2.wait();
  //       const { upvotes, downvotes } = await this.appraiser.s_users(
  //         this.users.ashylarry.address
  //       );
  //       expect(upvotes).to.equal(ethers.BigNumber.from(1));
  //       expect(downvotes).to.equal(ethers.BigNumber.from(0));
  //     });
  //     it(`should emit event when tybiggums upvotes ashylarry's review`, async function () {
  //       const tx = await this.appraiser
  //         .connect(this.users.tybiggums)
  //         .voteOnReview(
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT,
  //           true
  //         );
  //       await expect(tx)
  //         .to.emit(this.appraiser, `LogVoteOnReview`)
  //         .withArgs(
  //           this.users.tybiggums.address,
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT
  //         );
  //     });
  //     it(`should update ashylarry downvotes when tybiggums downvotes ashylarry's review`, async function () {
  //       const tx2 = await this.appraiser
  //         .connect(this.users.tybiggums)
  //         .voteOnReview(
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT,
  //           false
  //         );
  //       await tx2.wait();
  //       const { upvotes, downvotes } = await this.appraiser.s_users(
  //         this.users.ashylarry.address
  //       );
  //       expect(upvotes).to.equal(ethers.BigNumber.from(0));
  //       expect(downvotes).to.equal(ethers.BigNumber.from(1));
  //     });
  //     it(`should emit event when tybiggums downvotes ashylarry's review`, async function () {
  //       const tx = await this.appraiser
  //         .connect(this.users.tybiggums)
  //         .voteOnReview(
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT,
  //           false
  //         );
  //       await expect(tx)
  //         .to.emit(this.appraiser, `LogVoteOnReview`)
  //         .withArgs(
  //           this.users.tybiggums.address,
  //           this.WacArnolds.orgId,
  //           this.mockedResponses.mintReviewNFT
  //         );
  //     });
  //   });
  // });
};
export default {
  shouldManageOrgs,
  shouldManageReviews,
  shouldManageReviewsRatings,
};
