const { waffle } = require("hardhat");
const AppraiserOrganization_ABI = require("../../artifacts/contracts/AppraiserOrganization.sol/AppraiserOrganization.json");
const Verifier_ABI = require("../../artifacts/contracts/Verifier.sol/Verifier.json");

async function deployMockAppraiserOrganization(deployer) {
  const appraiserOrganization = await waffle.deployMockContract(
    deployer,
    AppraiserOrganization_ABI.abi
  );

  return appraiserOrganization;
}

async function deployMockVerifier(deployer) {
  const verifier = await waffle.deployMockContract(deployer, Verifier_ABI.abi);

  return verifier;
}

module.exports = { deployMockAppraiserOrganization, deployMockVerifier };
