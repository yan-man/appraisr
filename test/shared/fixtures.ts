import { Fixture, MockContract } from "ethereum-waffle";
import { ContractFactory, Wallet } from "ethers";
import { ethers } from "hardhat";
import {
  Appraiser,
  AppraiserOrganization,
  Verifier,
  Reviewer,
  MockVRFCoordinator,
  VRFv2Consumer as VRFv2ConsumerType,
} from "../../typechain";
import {
  deployMockAppraiserOrganization,
  deployMockVerifier,
  deployMockReviewer,
  deployMockAppraiser,
  deployMockVRFv2Consumer,
} from "./mocks";

type UnitAppraiserFixtureType = {
  appraiser: Appraiser;
  mockAppraiserOrganization: MockContract;
  mockVerifier: MockContract;
};

type UnitAppraiserOrganizationFixtureType = {
  appraiserOrganization: AppraiserOrganization;
  verifier: Verifier;
  mockVerifier: MockContract;
  constructorParams: Object;
};

type UnitVerifierFixtureType = {
  verifier: Verifier;
  mockAppraiser: MockContract;
  constructorParams: Object;
};

type UnitReviewerFixtureType = {
  reviewer: Reviewer;
  mockAppraiserOrganization: MockContract;
  mockAppraiserOrganization2: MockContract;
  mockVRFv2Consumer: MockContract;
};

type UnitVRFv2ConsumerFixtureType = {
  VRFv2Consumer: VRFv2ConsumerType;
  mockVRFCoordinator: MockVRFCoordinator;
  mockReviewer: MockContract;
};

const unitAppraiserFixture: Fixture<UnitAppraiserFixtureType> = async (
  signers: Wallet[]
) => {
  const deployer: Wallet = signers[0];

  const mockVerifier = await deployMockVerifier(deployer);
  const mockAppraiserOrganization = await deployMockAppraiserOrganization(
    deployer
  );
  const mockReviewer = await deployMockReviewer(deployer);

  const appraiserFactory: ContractFactory = await ethers.getContractFactory(
    `Appraiser`
  );
  const appraiser: Appraiser = (await appraiserFactory
    .connect(deployer)
    .deploy(mockReviewer.address)) as Appraiser;
  await appraiser.deployed();

  return { appraiser, mockAppraiserOrganization, mockVerifier };
};

const unitAppraiserOrganizationFixture: Fixture<
  UnitAppraiserOrganizationFixtureType
> = async (signers: Wallet[]) => {
  const deployer: Wallet = signers[0];

  const constructorParams: {
    orgId: number;
    name: string;
    addr: string;
    URI: string;
  } = {
    orgId: 0,
    name: "WacArnolds",
    addr: signers[10].address,
    URI: "ipfs://WacArnolds/",
  };

  const verifierFactory: ContractFactory = await ethers.getContractFactory(
    `Verifier`
  );
  const verifier: Verifier = (await verifierFactory
    .connect(deployer)
    .deploy(
      constructorParams.orgId,
      constructorParams.name,
      constructorParams.addr,
      constructorParams.URI,
      deployer.address
    )) as Verifier;
  await verifier.deployed();
  const mockVerifier: MockContract = await deployMockVerifier(deployer);

  const appraiserOrganizationFactory: ContractFactory =
    await ethers.getContractFactory(`AppraiserOrganization`);
  const appraiserOrganization: AppraiserOrganization =
    (await appraiserOrganizationFactory
      .connect(deployer)
      .deploy(
        constructorParams.orgId,
        constructorParams.name,
        constructorParams.addr,
        constructorParams.URI,
        mockVerifier.address,
        deployer.address
      )) as AppraiserOrganization;
  await appraiserOrganization.deployed();

  return { appraiserOrganization, verifier, constructorParams, mockVerifier };
};

const unitVerifierFixture: Fixture<UnitVerifierFixtureType> = async (
  signers: Wallet[]
) => {
  const deployer: Wallet = signers[0];

  const verifierFactory: ContractFactory = await ethers.getContractFactory(
    `Verifier`
  );
  const constructorParams: {
    orgId: number;
    name: string;
    addr: string;
    URI: string;
  } = {
    orgId: 1,
    name: "WacArnolds",
    addr: signers[10].address,
    URI: "ipfs://WacArnolds/",
  };
  const verifier: Verifier = (await verifierFactory
    .connect(deployer)
    .deploy(
      constructorParams.orgId,
      constructorParams.name,
      constructorParams.addr,
      constructorParams.URI,
      deployer.address
    )) as Verifier;
  await verifier.deployed();

  const mockAppraiser: MockContract = await deployMockAppraiser(deployer);

  return { verifier, constructorParams, mockAppraiser };
};

const unitReviewerFixture: Fixture<UnitReviewerFixtureType> = async (
  signers: Wallet[]
) => {
  const deployer: Wallet = signers[0];

  const Reviewer: ContractFactory = await ethers.getContractFactory(`Reviewer`);
  const reviewer: Reviewer = (await Reviewer.connect(
    deployer
  ).deploy()) as Reviewer;
  await reviewer.deployed();

  const mockVRFv2Consumer: MockContract = (await deployMockVRFv2Consumer(
    deployer
  )) as MockContract;
  const mockAppraiserOrganization: MockContract =
    (await deployMockAppraiserOrganization(deployer)) as MockContract;
  const mockAppraiserOrganization2: MockContract =
    (await deployMockAppraiserOrganization(deployer)) as MockContract;

  return {
    reviewer,
    mockAppraiserOrganization,
    mockAppraiserOrganization2,
    mockVRFv2Consumer,
  };
};

const unitVRFv2ConsumerFixture: Fixture<UnitVRFv2ConsumerFixtureType> = async (
  signers: Wallet[]
) => {
  const deployer: Wallet = signers[0];
  const mockReviewer: MockContract = (await deployMockReviewer(
    deployer
  )) as MockContract;
  const VRFv2ConsumerContractFactory: ContractFactory =
    await ethers.getContractFactory(`VRFv2Consumer`);

  const VRFCoordinatorFactory: ContractFactory =
    await ethers.getContractFactory(`MockVRFCoordinator`);
  const mockVRFCoordinator: MockVRFCoordinator =
    (await VRFCoordinatorFactory.connect(
      deployer
    ).deploy()) as MockVRFCoordinator;

  const VRFv2Consumer: VRFv2ConsumerType =
    (await VRFv2ConsumerContractFactory.connect(deployer).deploy(
      1,
      mockReviewer.address,
      mockVRFCoordinator.address
    )) as VRFv2ConsumerType;
  await VRFv2Consumer.deployed();

  return {
    VRFv2Consumer,
    mockReviewer,
    mockVRFCoordinator,
  };
};

export {
  unitAppraiserFixture,
  unitAppraiserOrganizationFixture,
  unitVerifierFixture,
  unitReviewerFixture,
  unitVRFv2ConsumerFixture,
};
