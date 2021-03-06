import { ContractReceipt, BigNumber } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

const shouldDeploy = (): void => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiser.owner()).to.equal(
        this.users.deployer.address
      );
    });
  });
};

const shouldManageOrgs = (): void => {
  context(`# manage organizations`, async function () {
    describe("...save new orgs", async () => {
      beforeEach(`save new org`, async function () {
        this.orgs.WacArnolds.orgId = await this.appraiser.numberOrganizations();
        this.tx = await this.appraiser.addOrganization(
          this.orgs.WacArnolds.name,
          this.orgs.WacArnolds.addr,
          this.orgs.WacArnolds.URI
        );
        this.receipt = await this.tx.wait();
      });

      it(`Should update state vars after saving new organization WacArnolds`, async function () {
        expect(
          await this.appraiser.s_organizations(this.orgs.WacArnolds.orgId)
        ).to.not.equal(ethers.BigNumber.from(0));
      });

      it(`Should emit events when new organization WacArnolds saved`, async function () {
        // events emitted
        await expect(this.tx)
          .to.emit(this.appraiser, `LogAddOrganization`)
          .withArgs(this.orgs.WacArnolds.orgId);

        const eventId = [...this.receipt.events.keys()].filter(
          (id) => this.receipt.events[id].event === "OwnershipTransferred"
        );
        expect(eventId).to.have.lengthOf(3);
        const { newOwner }: { newOwner: string } = {
          ...this.receipt.events[eventId[0]].args,
        };
        expect(newOwner).to.equal(this.appraiser.address);
      });

      describe(`...After new org WacArnolds saved`, async () => {
        beforeEach(async function () {});
        it(`should return current number of orgs (1)`, async function () {
          expect(await this.appraiser.numberOrganizations()).to.equal(
            ethers.BigNumber.from(1)
          );
        });
        it(`Should throw Appraiser__DuplicateOrgName error on duplicate WacArnolds org name`, async function () {
          await expect(
            this.appraiser.addOrganization(
              this.orgs.WacArnolds.name,
              this.orgs.WacArnolds.addr,
              this.orgs.WacArnolds.URI
            )
          ).to.be.revertedWith(`Appraiser__DuplicateOrgName`);
        });

        it(`should save org2 studio54`, async function () {
          this.orgs.studio54.orgId = await this.appraiser.numberOrganizations();
          const tx = await this.appraiser.addOrganization(
            this.orgs.studio54.name,
            this.orgs.studio54.addr,
            this.orgs.studio54.URI
          );
          const receipt = await tx.wait();
          const eventId = [...receipt.events!.keys()].filter(
            (id) => receipt.events![id].event === "LogAddOrganization"
          );
          const emittedOrgId = {
            ...receipt.events![eventId[0]].args,
          };
          expect(emittedOrgId.orgId).to.equal(
            ethers.BigNumber.from(this.orgs.studio54.orgId)
          );
        });

        it(`should emit events after org2 studio54 saved`, async function () {
          const tx = await this.appraiser.addOrganization(
            this.orgs.studio54.name,
            this.orgs.studio54.addr,
            this.orgs.studio54.URI
          );
          const receipt = await tx.wait();

          await expect(tx)
            .to.emit(this.appraiser, `LogAddOrganization`)
            .withArgs(1);
        });
      });
    });
  });
};

export default {
  shouldDeploy,
  shouldManageOrgs,
};
