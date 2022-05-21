const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const {
  deployMockAppraiserOrganization,
  deployMockVerifier,
  deployMockReviewer,
  deployMockAppraiser,
} = require("./mocks");

const unitAppraiserFixture = async (signers) => {
  const deployer = signers[0];

  const mockVerifier = await deployMockVerifier(deployer);
  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );
  const mockReviewer = await deployMockReviewer(deployer);

  const appraiserFactory = await ethers.getContractFactory(`Appraiser`);
  const appraiser = await appraiserFactory
    .connect(deployer)
    .deploy(mockReviewer.address);
  await appraiser.deployed();

  return { appraiser, mockAppraiserOrganization, mockVerifier };
};

const unitAppraiserOrganizationFixture = async (signers) => {
  const deployer = signers[0];

  const constructorParams = {
    orgId: 0,
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
      constructorParams.URI,
      deployer.address
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
      constructorParams.URI,
      deployer.address
    );
  await verifier.deployed();

  return { verifier, constructorParams };
};

const unitReviewerFixture = async (signers) => {
  const deployer = signers[0];

  const reviewerFactory = await ethers.getContractFactory(`Reviewer`);
  const reviewer = await reviewerFactory.connect(deployer).deploy();
  await reviewer.deployed();

  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );

  return { reviewer, mockAppraiserOrganization };
};

module.exports = {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
  unitReviewerFixture,
};
