const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldManageOrgs = () => {
  context(`#CRUD organizations`, async function () {
    it("Should save new organization", async function () {
      const expectedCompanyName = "McDonalds";
      const expectedBusinessAddress =
        "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
      const tx = await this.appraiser.addOrganization(
        expectedCompanyName,
        expectedBusinessAddress
      );
      const receipt = await tx.wait();
      const { orgId, companyName, businessAddress } =
        await this.appraiser.s_organizations(0);

      expect(orgId).to.equal(ethers.BigNumber.from(0));
      expect(companyName).to.equal(expectedCompanyName);
      expect(businessAddress).to.equal(expectedBusinessAddress);

      const { orgId: eventOrgId } = { ...receipt.events[0].args };

      expect(eventOrgId).to.equal(ethers.BigNumber.from(0));
      expect(await this.appraiser.currentOrgId()).to.equal(
        ethers.BigNumber.from(1)
      );
      expect(await this.appraiser.numberOrganizations()).to.equal(
        ethers.BigNumber.from(1)
      );
    });

    // should have error if org already exists

    // should deploy an ERC 721 contract
    //

    // save a new review for a
  });
};

module.exports = { shouldManageOrgs };
