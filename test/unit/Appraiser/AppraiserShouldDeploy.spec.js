const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`#deploy`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.appraiser.owner()).to.equal(this.addrs[0].address);
    });
  });
};

module.exports = { shouldDeploy };
