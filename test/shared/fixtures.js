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

const unitAppraiserOrganizationFixture = async (signers) => {
  const deployer = signers[0];

  const appraiserOrganizationFactory = await ethers.getContractFactory(
    `AppraiserOrganization`
  );
  const constructorParams = "URI";
  const appraiserOrganization = await appraiserOrganizationFactory
    .connect(deployer)
    .deploy(constructorParams);
  await appraiserOrganization.deployed();

  return { appraiserOrganization, constructorParams };
};

module.exports = { unitAppraiserFixture, unitAppraiserOrganizationFixture };
