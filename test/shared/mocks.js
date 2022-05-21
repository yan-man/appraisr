const { waffle } = require("hardhat");
const AppraiserOrganization_ABI = require("../../artifacts/contracts/AppraiserOrganization.sol/AppraiserOrganization.json");
const Verifier_ABI = require("../../artifacts/contracts/Verifier.sol/Verifier.json");
const Reviewer_ABI = require("../../artifacts/contracts/Reviewer.sol/Reviewer.json");
const Appraiser_ABI = require("../../artifacts/contracts/Appraiser.sol/Appraiser.json");

async function deployMockAppraiserOrganization(deployer) {
  const appraiserOrganization = await waffle.deployMockContract(
    deployer,
    AppraiserOrganization_ABI.abi
  );

  return appraiserOrganization;
}

async function deployMockVerifier(deployer) {
  const verifier = await waffle.deployMockContract(deployer, Verifier_ABI.abi);
  await verifier.mock.balanceOf.returns(0);
  await verifier.mock.VERIFIER.returns(0);
  await verifier.mock.burnVerifierForAddress.returns();

  return verifier;
}

async function deployMockReviewer(deployer) {
  const reviewer = await waffle.deployMockContract(deployer, Reviewer_ABI.abi);
  await reviewer.mock.setAppraiserOrganizationContractAddress.returns();

  return reviewer;
}

async function deployMockAppraiser(deployer) {
  const appraiser = await waffle.deployMockContract(
    deployer,
    Appraiser_ABI.abi
  );
  return appraiser;
}

module.exports = {
  deployMockReviewer,
  deployMockAppraiserOrganization,
  deployMockVerifier,
  deployMockAppraiser,
};
