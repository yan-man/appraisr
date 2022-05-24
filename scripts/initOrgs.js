const { ethers } = require("hardhat");
const orgs = require("../helpers/library.json");

const deployInitialOrganizations = async (appraiser, reviewer) => {
  const deployedOrgs = await deployOrgs(appraiser, reviewer);
  await deployReviews(appraiser, reviewer, deployedOrgs);
};

const deployReviews = async (appraiser, reviewer, deployedOrgs) => {
  const signers = await ethers.getSigners();
  const users = signers.slice(1, -2);

  await Promise.all(
    orgs.map(async (o, orgInd) => {
      const reviews = [];
      await Promise.all(
        o.Reviews.map(async (review) => {
          const user = users.pop();

          // console.log(o.orgId);
          const tx = await reviewer
            .connect(user)
            .mintReview(o.orgId, review.Rating, review.Review);
          const receipt = await tx.wait();
          const eventId = [...receipt.events.keys()].filter(
            (id) => receipt.events[id].event === "LogMintReview"
          );
          const { reviewId: emittedId } = {
            ...receipt.events[eventId[0]].args,
          };
          const reviewId = emittedId.toNumber();

          review.Author = user.address;
          review.reviewId = reviewId;
          reviews.push(review);

          const ao = await ethers.getContractAt(
            `AppraiserOrganization`,
            deployedOrgs[orgInd].AppraiserOrganization
          );
          console.log(await ao.s_reviews(reviewId));
        })
      );
      // console.log(reviews);
    })
  );
};

const deployOrgs = async (appraiser, reviewer) => {
  const signers = await ethers.getSigners();
  const admins = signers.slice("-" + orgs.length);
  const updatedOrgs = [];
  const deployedOrgs = [];
  await Promise.all(
    orgs.map(async (o, index) => {
      o.Admin = admins[index].address;
      const tx = await appraiser
        .connect(signers[0])
        .addOrganization(o.Name, o.Admin, o.URI, {
          gasLimit: 30000000,
        });
      const receipt = await tx.wait();
      const eventId = [...receipt.events.keys()].filter(
        (id) => receipt.events[id].event === "LogAddOrganization"
      );
      const { orgId: emittedId } = {
        ...receipt.events[eventId[0]].args,
      };
      const orgId = emittedId.toNumber();
      const org = await appraiser.s_deployedContracts(orgId);
      deployedOrgs.push(org);

      o.orgId = orgId;
      updatedOrgs.push(o);

      console.log(`${o.Name} org deployed: `);
      console.log(`     Admin: ${o.Admin}`);
      console.log(`     AppraiserOrganization: ${org.AppraiserOrganization}`);
      console.log(`     Verifier: ${org.Verifier}`);
    })
  );

  saveOrgsFrontendFiles(updatedOrgs);
  return deployedOrgs;
};

function saveOrgsFrontendFiles(deployedOrgs) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../helpers";

  fs.writeFileSync(
    contractsDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

function saveReviewsFrontendFiles(deployedOrgs) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../helpers";

  fs.writeFileSync(
    contractsDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

module.exports = { deployInitialOrganizations };
