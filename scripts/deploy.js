async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const reviewer = await deployReviewerContract();
  const appraiser = await deployAppraiserContract(reviewer.address);

  saveFrontendFiles(appraiser, reviewer);
}

async function deployReviewerContract() {
  const Reviewer = await ethers.getContractFactory("Reviewer");
  const reviewer = await Reviewer.deploy();
  await reviewer.deployed();

  console.log("Reviewer deployed to:", reviewer.address);
  return reviewer;
}

async function deployAppraiserContract(reviewerAddr) {
  const Appraiser = await ethers.getContractFactory("Appraiser");
  const appraiser = await Appraiser.deploy(reviewerAddr);
  await appraiser.deployed();

  console.log("Appraiser deployed to:", appraiser.address);
  return appraiser;
}

async function saveFrontendFiles(appraiser, reviewer) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(
      {
        Appraiser: appraiser.address,
        Reviewer: reviewer.address,
      },
      undefined,
      2
    )
  );

  const AppraiserArtifact = artifacts.readArtifactSync("Appraiser");
  fs.writeFileSync(
    contractsDir + "/Appraiser.json",
    JSON.stringify(AppraiserArtifact, null, 2)
  );
  const ReviewerArtifact = artifacts.readArtifactSync("Reviewer");
  fs.writeFileSync(
    contractsDir + "/Reviewer.json",
    JSON.stringify(ReviewerArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
