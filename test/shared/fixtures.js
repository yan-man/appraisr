const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const {
  deployMockAppraiserOrganization,
  deployMockVerifier,
} = require("./mocks");

const unitAppraiserFixture = async (signers) => {
  const deployer = signers[0];

  const appraiserFactory = await ethers.getContractFactory(`Appraiser`);

  const appraiser = await appraiserFactory.connect(deployer).deploy();
  await appraiser.deployed();

  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );
  const mockVerifier = await deployMockVerifier(deployer);

  return { appraiser, mockAppraiserOrganization, mockVerifier };
};

const unitAppraiserOrganizationFixture = async (signers) => {
  const deployer = signers[0];

  const appraiserOrganizationFactory = await ethers.getContractFactory(
    `AppraiserOrganization`
  );
  const constructorParams = [1, "URI"];
  const appraiserOrganization = await appraiserOrganizationFactory
    .connect(deployer)
    .deploy(constructorParams[0], constructorParams[1]);
  await appraiserOrganization.deployed();

  const mockVerifier = await deployMockVerifier(deployer);

  return { appraiserOrganization, constructorParams, mockVerifier };
};

module.exports = { unitAppraiserFixture, unitAppraiserOrganizationFixture };
