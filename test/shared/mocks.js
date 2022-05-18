const { waffle } = require("hardhat");
const ERC_20_ABI = require("../../abis/erc20.abi.json");
const AppraiserOrganization_ABI = require("../../artifacts/contracts/AppraiserOrganization.sol/AppraiserOrganization.json");

async function deployMockREPToken(deployer) {
  const erc20 = await waffle.deployMockContract(deployer, ERC_20_ABI);

  await erc20.mock.name.returns(`Reputation Coin`);
  await erc20.mock.symbol.returns(`REP`);
  await erc20.mock.transferFrom.returns(true);

  return erc20;
}

async function deployMockAppraiserOrganization(deployer) {
  const appraiserOrganization = await waffle.deployMockContract(
    deployer,
    AppraiserOrganization_ABI.abi
  );

  return appraiserOrganization;
}

module.exports = { deployMockREPToken, deployMockAppraiserOrganization };
