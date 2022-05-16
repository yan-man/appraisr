const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`#deploy`, async function () {
    it(`should revert if the token amount is not greater than zero`, async function () {
      // console.log(this.REPToken);
    });
  });
};

module.exports = { shouldDeploy };
