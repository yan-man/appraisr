import { Fixture, MockContract } from "ethereum-waffle";
import { Wallet } from "@ethersproject/wallet";
import {
  Appraiser,
  AppraiserOrganization,
  Verifier,
  Reviewer,
  MockVRFCoordinator,
  VRFv2Consumer as VRFv2ConsumerType,
} from "../../typechain";

declare module "mocha" {
  export interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Wallet[];
    mocks: Mocks;
    appraiser: Appraiser;
    appraiserOrganization: AppraiserOrganization;
    verifier: Verifier;
    mockVRFv2Consumer: MockVRFCoordinator;
  }
}

export interface Users {
  deployer: Wallet;
  ashylarry: Wallet;
  tybiggums: Wallet;
  rickjames: Wallet;
  dave: Wallet;
  prince: Wallet;
}

export interface Orgs {
  WacArnolds: Wallet;
  studio54: Wallet;
}

export interface Mocks {
  mockAppraiser?: MockContract;
  mockVerifier?: MockContract;
  mockAppraiserOrganization?: MockContract;
  mockAppraiserOrganization2?: MockContract;
  mockReviewer?: MockContract;
  mockVRFv2Consumer?: MockContract;
}
