const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`#deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiser.owner()).to.equal(this.addrs[0].address);
    });
  });
};

const shouldManageOrgs = () => {
  context(`#manage organizations`, async function () {
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
  context(`#manage reviews`, async function () {
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
      it(`should not allow a review for non-valid org`, async function () {
        await expect(
          this.appraiser.mintReview(
            this.orgId.toNumber() + 1,
            50,
            "test review"
          )
        ).to.be.revertedWith(`InvalidOrgId`);
      });
      it(`should save a new review for an existing org`, async function () {
        const tx = await this.appraiser.mintReview(
          this.orgId.toNumber(),
          50,
          "test review"
        );
      });
    });
  });
};

module.exports = { shouldDeploy, shouldManageOrgs, shouldManageReviews };
