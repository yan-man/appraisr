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
      it(`Should save new organization`, async function () {
        const company = {
          name: "WacArnolds",
          address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        };
        const tx = await this.appraiser.addOrganization(
          company.name,
          company.address
        );

        const receipt = await tx.wait();
        const { orgId, name, addr } = await this.appraiser.s_organizations(0);

        expect(orgId).to.equal(ethers.BigNumber.from(0));
        expect(name).to.equal(company.name);
        expect(addr).to.equal(company.address);

        // events emitted
        let eventId = [...receipt.events.keys()].filter(
          (id) => receipt.events[id].event === "LogAddOrganization"
        );
        const { orgId: eventOrgId } = { ...receipt.events[eventId[0]].args };
        expect(eventOrgId).to.equal(ethers.BigNumber.from(0));

        eventId = [...receipt.events.keys()].filter(
          (id) => receipt.events[id].event === "OwnershipTransferred"
        );
        expect(eventId).to.have.lengthOf(1);
        const { newOwner } = { ...receipt.events[eventId[0]].args };
        expect(newOwner).to.equal(this.appraiser.address);
      });

      it(`Should emit events`, async function () {
        const company = {
          name: "WacArnolds",
          address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        };
        const tx = await this.appraiser.addOrganization(
          company.name,
          company.address
        );
        const receipt = await tx.wait();

        // events emitted
        await expect(tx).to.emit(this.appraiser, `LogAddOrganization`);
        await expect(tx).to.emit(this.appraiser, `LogNFTContractDeployed`);

        let eventId = [...receipt.events.keys()].filter(
          (id) => receipt.events[id].event === "LogAddOrganization"
        );
        const { orgId: eventOrgId } = { ...receipt.events[eventId[0]].args };
        expect(eventOrgId).to.equal(ethers.BigNumber.from(0));

        eventId = [...receipt.events.keys()].filter(
          (id) => receipt.events[id].event === "OwnershipTransferred"
        );
        expect(eventId).to.have.lengthOf(1);
        const { newOwner } = { ...receipt.events[eventId[0]].args };
        expect(newOwner).to.equal(this.appraiser.address);
      });

      describe("...After new org saved", async () => {
        beforeEach(async function () {
          this.company = {
            name: "WacArnolds",
            address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
          };
          this.tx = await this.appraiser.addOrganization(
            this.company.name,
            this.company.address
          );
          this.receipt = await this.tx.wait();
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
          expect(await this.appraiser.aoContracts(0)).to.equal(
            this.eventArgs.aoContractAddress
          );
        });
        it(`Should throw DuplicateOrgName error on duplicate org name`, async function () {
          await expect(
            this.appraiser.addOrganization(
              this.company.name,
              this.company.address
            )
          ).to.be.revertedWith(`DuplicateOrgName`);
        });
        it(`Should throw DuplicateOrgAddr error on duplicate org addr`, async function () {
          await expect(
            this.appraiser.addOrganization(
              `${this.company.name}1`,
              this.company.address
            )
          ).to.be.revertedWith(`DuplicateOrgAddr`);
        });
      });
    });
  });
};

const shouldManageReviews = () => {
  context(`# manage reviews`, async function () {
    describe("...After new org exists", async () => {
      beforeEach(async function () {
        this.company = {
          name: "WacArnolds",
          address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        };
        this.tx = await this.appraiser.addOrganization(
          this.company.name,
          this.company.address
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
        expect(await this.appraiser.aoContracts(0)).to.equal(
          this.mocks.mockAppraiserOrganization.address
        );
      });

      context(`# mint review`, async function () {
        describe("...After mock AO contract set", async () => {
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
          });

          it(`should update s_reviews state var`, async function () {
            const tx = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              50,
              "test review"
            );
            await tx.wait();
            expect(
              await this.appraiser.s_reviews(
                0,
                this.mockedResponses.mintReviewNFT
              )
            ).to.equal(this.signers[0].address);
          });

          it(`should create new user`, async function () {
            const tx = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              50,
              "test review"
            );
            await tx.wait();

            const { reputation, isRegistered } = await this.appraiser.users(
              this.signers[0].address
            );
            expect(reputation).to.equal(ethers.BigNumber.from(0));
            expect(isRegistered).to.equal(true);
          });

          it(`should emit LogMintReview event`, async function () {
            const tx = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              50,
              "test review"
            );
            await expect(tx).to.emit(this.appraiser, `LogMintReview`);
          });

          it(`should emit LogNewUser event`, async function () {
            const tx = await this.appraiser.mintReview(
              this.orgId.toNumber(),
              50,
              "test review"
            );
            await expect(tx).to.emit(this.appraiser, `LogNewUser`);
          });

          // scenario: user creates second review at new org
          // test: if user already exists, don't create new user

          // scenario: user tries to create second review at first org
          // throw error
        });
      });
    });
  });
};

const shouldManageReviewsRatings = () => {
  // context(`# manage reviews`, async function () {
  //   describe("...After new org exists", async () => {
  //     beforeEach(async function () {
  //       this.company = {
  //         name: "WacArnolds",
  //         address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  //       };
  //       this.tx = await this.appraiser.addOrganization(
  //         this.company.name,
  //         this.company.address
  //       );
  //       this.receipt = await this.tx.wait();
  //       const eventId = [...this.receipt.events.keys()].filter(
  //         (id) => this.receipt.events[id].event === "LogAddOrganization"
  //       );
  //       const { orgId } = {
  //         ...this.receipt.events[eventId[0]].args,
  //       };
  //       this.orgId = orgId;
  //       this.mockedResponses = {
  //         mintReviewNFT: 100,
  //       };
  //       await this.mocks.mockAppraiserOrganization.mock.mintReviewNFT.returns(
  //         this.mockedResponses.mintReviewNFT
  //       );
  //       const tx = await this.appraiser.setAOContractAddress(
  //         this.orgId.toNumber(),
  //         this.mocks.mockAppraiserOrganization.address
  //       );
  //       await tx.wait();
  //     });
  //     it.only(`user2 should be able to upvote review from user1`, async function () {
  //       // expect(1).to.equal(1);
  //       console.log(
  //         await this.appraiser
  //           .connect(this.signers[1])
  //           .rateReview(this.orgId, this.mockedResponses.mintReviewNFT, true)
  //       );
  //     });
  //   });
  // });
};

module.exports = {
  shouldDeploy,
  shouldManageOrgs,
  shouldManageReviews,
  shouldManageReviewsRatings,
};
