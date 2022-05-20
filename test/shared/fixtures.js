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

  const constructorParams = {
    orgId: 1,
    name: "WacArnolds",
    addr: signers[10].address,
    URI: "ipfs://WacArnolds/",
  };

  const verifierFactory = await ethers.getContractFactory(`Verifier`);
  const verifier = await verifierFactory
    .connect(deployer)
    .deploy(
      constructorParams.orgId,
      constructorParams.name,
      constructorParams.addr,
      constructorParams.URI
    );
  await verifier.deployed();
  const mockVerifier = await deployMockVerifier(deployer);

  const appraiserOrganizationFactory = await ethers.getContractFactory(
    `AppraiserOrganization`
  );
  const appraiserOrganization = await appraiserOrganizationFactory
    .connect(deployer)
    .deploy(
      constructorParams.orgId,
      constructorParams.name,
      constructorParams.addr,
      constructorParams.URI,
      mockVerifier.address
    );
  await appraiserOrganization.deployed();

  return { appraiserOrganization, verifier, constructorParams, mockVerifier };
};

const unitVerifierFixture = async (signers) => {
  const deployer = signers[0];

  const verifierFactory = await ethers.getContractFactory(`Verifier`);
  const constructorParams = {
    orgId: 1,
    name: "WacArnolds",
    addr: signers[10].address,
    URI: "ipfs://WacArnolds/",
  };
  const verifier = await verifierFactory
    .connect(deployer)
    .deploy(
      constructorParams.orgId,
      constructorParams.name,
      constructorParams.addr,
      constructorParams.URI
    );
  await verifier.deployed();

  return { verifier, constructorParams };
};

module.exports = {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
};
