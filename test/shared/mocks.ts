import { waffle } from "hardhat";
import { MockContract } from "ethereum-waffle";
import { Signer } from "ethers";
import AppraiserOrganization_ABI from "../../artifacts/contracts/AppraiserOrganization.sol/AppraiserOrganization.json";
import Verifier_ABI from "../../artifacts/contracts/Verifier.sol/Verifier.json";
import Reviewer_ABI from "../../artifacts/contracts/Reviewer.sol/Reviewer.json";
import Appraiser_ABI from "../../artifacts/contracts/Appraiser.sol/Appraiser.json";
import VRFv2Consumer_ABI from "../../artifacts/contracts/VRFv2Consumer.sol/VRFv2Consumer.json";

async function deployMockVRFv2Consumer(
  deployer: Signer
): Promise<MockContract> {
  const VRFv2Consumer = await waffle.deployMockContract(
    deployer,
    VRFv2Consumer_ABI.abi
  );
  await VRFv2Consumer.mock.requestRandomWords.returns();

  return VRFv2Consumer;
}

async function deployMockAppraiserOrganization(
  deployer: Signer
): Promise<MockContract> {
  const appraiserOrganization = await waffle.deployMockContract(
    deployer,
    AppraiserOrganization_ABI.abi
  );
  await appraiserOrganization.mock.updateReviewGroupId.returns();

  return appraiserOrganization;
}

async function deployMockVerifier(deployer: Signer): Promise<MockContract> {
  const verifier = await waffle.deployMockContract(deployer, Verifier_ABI.abi);
  await verifier.mock.balanceOf.returns(0);
  await verifier.mock.VERIFIER.returns(0);
  await verifier.mock.burnVerifierForAddress.returns();

  return verifier;
}

async function deployMockReviewer(deployer: Signer): Promise<MockContract> {
  const reviewer = await waffle.deployMockContract(deployer, Reviewer_ABI.abi);
  await reviewer.mock.setAppraiserOrganizationContractAddress.returns();
  await reviewer.mock.updateReviewGroupId.returns();

  return reviewer;
}

async function deployMockAppraiser(deployer: Signer): Promise<MockContract> {
  const appraiser = await waffle.deployMockContract(
    deployer,
    Appraiser_ABI.abi
  );
  return appraiser;
}

// async function deployMockVRFCoordinatorV2Interface(deployer) {
//   const VRFCoordinatorV2Interface = await waffle.deployMockContract(
//     deployer,
//     VRFCoordinatorV2Interface_ABI.abi
//   );
//   await VRFCoordinatorV2Interface.mock.setAppraiserOrganizationContractAddress.returns();
//   return VRFCoordinatorV2Interface;
// }

export default {
  deployMockReviewer,
  deployMockAppraiserOrganization,
  deployMockVerifier,
  deployMockAppraiser,
  deployMockVRFv2Consumer,
};
