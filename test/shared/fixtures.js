const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const { deployMockAppraiserOrganization } = require("./mocks");

const unitAppraiserFixture = async (signers) => {
  const deployer = signers[0];

  const appraiserFactory = await ethers.getContractFactory(`Appraiser`);

  const appraiser = await appraiserFactory.connect(deployer).deploy();
  await appraiser.deployed();

  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );

  return { appraiser, mockAppraiserOrganization };
};

module.exports = { unitAppraiserFixture };
