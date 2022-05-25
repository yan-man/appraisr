const { ethers } = require("hardhat");
const math = require("mathjs");
const helpersDir = __dirname + "/../frontend/src/helpers";
const orgs = require(`${helpersDir}/library.json`);

const deployInitialOrganizations = async (appraiser, reviewer) => {
  const signers = await ethers.getSigners();
  const users = signers.slice(1, -2);

  // 20 hardhat accounts: [index]
  // 0) - deployer
  // 19) - admin for org1
  // 20) - admin for org2
  // 1)...18) - test users
  // 1)...5) - test users w/Verifier token

  let deployedOrgs = await deployOrgs(appraiser, reviewer, users);
  deployedOrgs = await deployReviews(appraiser, reviewer, deployedOrgs, users);
};

const deployReviews = async (appraiser, reviewer, deployedOrgs, _users) => {
  const users = [..._users];
  const updatedOrgs = [];
  await Promise.all(
    orgs.map(async (o, orgInd) => {
      const reviews = [];
      await Promise.all(
        o.Reviews.map(async (review) => {
          const user = users.pop();

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

          const ao = await ethers.getContractAt(
            `AppraiserOrganization`,
            deployedOrgs[orgInd].AppraiserOrganization
          );
          const savedReview = await ao.s_reviews(reviewId);

          review.Author = user.address;
          review.reviewId = reviewId;
          review.Timestamp = savedReview.unixtime.toNumber();

          reviews.push(review);

          console.log(
            `Review for ${o.Name} given by ${review.Author} ("${review.Review}", Rating = ${review.Rating})`
          );
        })
      );
      o.Reviews = reviews;
      const sum = reviews.reduce((total, next) => {
        return total + Number(next.Rating);
      }, 0);
      o.AvgRating = math.divide(sum, reviews.length);
      updatedOrgs.push(o);
    })
  );

  saveOrgsFrontendFiles(updatedOrgs);
  return updatedOrgs;
};

const deployOrgs = async (appraiser, reviewer, users) => {
  const signers = await ethers.getSigners();
  const admins = signers.slice("-" + orgs.length);
  const updatedOrgs = [];
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

      o.orgId = orgId;
      o.AppraiserOrganization = org.AppraiserOrganization;
      o.Verifier = org.Verifier;
      updatedOrgs.push(o);

      console.log(`${o.Name} org deployed: `);
      console.log(`     Admin: ${o.Admin}`);
      console.log(`     AppraiserOrganization: ${o.AppraiserOrganization}`);
      console.log(`     Verifier: ${o.Verifier}`);
    })
  );
  console.log(``);

  // transfer a V token to each user 1-5, from admin
  await Promise.all(
    updatedOrgs.map(async (o, index) => {
      const verifier = await ethers.getContractAt(`Verifier`, o.Verifier);
      await Promise.all(
        users.map(async (user) => {
          await verifier
            .connect(admins[index])
            .safeTransferFrom(admins[index].address, user.address, 0, 1, []);
          // const balance = await verifier.balanceOf(user.address, 0);
          // console.log(
          //   `User (${user.address}) ${
          //     o.Name
          //   } Verifier Tokens: ${balance.toNumber()}`
          // );
        })
      );
    })
  );
  // console.log(``);

  saveOrgsFrontendFiles(updatedOrgs);
  return updatedOrgs;
};

function saveOrgsFrontendFiles(deployedOrgs) {
  const fs = require("fs");

  fs.writeFileSync(
    helpersDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

function saveReviewsFrontendFiles(deployedOrgs) {
  const fs = require("fs");

  fs.writeFileSync(
    helpersDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

module.exports = { deployInitialOrganizations };
