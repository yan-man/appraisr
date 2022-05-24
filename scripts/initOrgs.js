const orgs = require("../helpers/library.json");

const deployInitialOrganizations = async (appraiser, reviewer) => {
  const deployedOrgs = await deployOrgs(appraiser, reviewer);
  await deployReviews(appraiser, reviewer);
};

const deployReviews = async (appraiser, reviewer) => {
  const signers = await ethers.getSigners();
  const users = signers.slice(10);

  await Promise.all(
    orgs.map(async (o, index) => {
      const reviews = [];
      await Promise.all(
        o.Reviews.map(async (review) => {
          const user = users.pop();

          console.log();

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
          review.reviewId = reviewId;
          reviews.push(review);
        })
      );
      console.log(reviews);
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
      o.Admin = o.Admin ? o.Admin : admins[index].address;
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
      deployedOrgs.push(await appraiser.s_deployedContracts(orgId));

      o.orgId = orgId;
      updatedOrgs.push(o);
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
