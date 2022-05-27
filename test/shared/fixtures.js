const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const {
  deployMockAppraiserOrganization,
  deployMockVerifier,
  deployMockReviewer,
  deployMockAppraiser,
  deployMockVRFv2Consumer,
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
      mockVerifier.address,
      deployer.address
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

  const mockAppraiser = await deployMockAppraiser(deployer);

  return { verifier, constructorParams, mockAppraiser };
};

const unitReviewerFixture = async (signers) => {
  const deployer = signers[0];

  const Reviewer = await ethers.getContractFactory(`Reviewer`);
  const reviewer = await Reviewer.connect(deployer).deploy();
  await reviewer.deployed();

  const mockVRFv2Consumer = await deployMockVRFv2Consumer(deployer);
  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );
  const mockAppraiserOrganization2 = await deployMockAppraiserOrganization(
    deployer
  );

  return {
    reviewer,
    mockAppraiserOrganization,
    mockAppraiserOrganization2,
    mockVRFv2Consumer,
  };
};

const unitVRFv2ConsumerFixture = async (signers) => {
  const deployer = signers[0];
  const mockReviewer = await deployMockReviewer(deployer);
  const VRFv2ConsumerContract = await ethers.getContractFactory(
    `VRFv2Consumer`
  );

  const VRFCoordinatorFactory = await ethers.getContractFactory(
    `MockVRFCoordinator`
  );
  const mockVRFCoordinator = await VRFCoordinatorFactory.connect(
    deployer
  ).deploy();

  const VRFv2Consumer = await VRFv2ConsumerContract.connect(deployer).deploy(
    1,
    mockReviewer.address,
    mockVRFCoordinator.address
  );
  await VRFv2Consumer.deployed();

  return {
    VRFv2Consumer,
    mockReviewer,
    mockVRFCoordinator,
  };
};

module.exports = {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
  unitReviewerFixture,
  unitVRFv2ConsumerFixture,
};
