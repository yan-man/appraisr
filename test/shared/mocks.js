import { waffle } from "hardhat";
import ERC_20_ABI from "../../abis/erc20.abi.json";

export async function deployMockREP(deployer) {
  const erc20 = await waffle.deployMockContract(deployer, ERC_20_ABI);

  await erc20.mock.name.returns(`Reputation Coin`);
  await erc20.mock.symbol.returns(`REP`);
  await erc20.mock.transferFrom.returns(true);

  return erc20;
}
