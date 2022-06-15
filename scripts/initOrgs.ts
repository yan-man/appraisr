import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { divide } from "mathjs";
const helpersDir = `${__dirname}/../frontend/src/helpers/`;
const orgs: Organization[] = require(`${helpersDir}/library.json`);
import { Appraiser, Reviewer, VRFv2Consumer } from "../typechain";
import { BigNumber } from "ethers";

interface Organization {
  URI: string;
  Name: string;
  Description: string;
  Category: string;
  Admin: string;
  Reviews: Review[];
  orgId: number;
  AppraiserOrganization: string;
  Verifier: string;
  AvgRating: number;
}

interface Review {
  Author: string;
  Rating: number;
  Review: string;
  Upvotes: number;
  Downvotes: number;
  reviewId: number;
  Timestamp: number;
  IsVerified: boolean;
}

const deployInitialOrganizations = async (
  appraiser: Appraiser,
  reviewer: Reviewer
): Promise<void> => {
  const signers = await ethers.getSigners();
  const users: SignerWithAddress[] = signers.slice(1, -2);

  // 20 hardhat accounts: [index]
  // 0) - deployer
  // 1)...18) - test users
  // 1)...5) - test users w/Verifier token
  // 18) - admin for org1
  // 19) - admin for org2

  let deployedOrgs = await deployOrgs(appraiser, reviewer, users);
  deployedOrgs = await deployReviews(appraiser, reviewer, deployedOrgs, users);
};

const deployReviews = async (
  appraiser: Appraiser,
  reviewer: Reviewer,
  deployedOrgs: Organization[],
  _users: SignerWithAddress[]
): Promise<Organization[]> => {
  const users: SignerWithAddress[] = [..._users];
  await Promise.all(
    orgs.map(async (o: Organization, orgInd: number) => {
      const reviews: Review[] = [];
      await Promise.all(
        o.Reviews.map(async (review) => {
          const user = users.pop();

          const tx = await reviewer
            .connect(user!)
            .mintReview(o.orgId, review.Rating, review.Review);
          const receipt = await tx.wait();
          const eventId = [...receipt.events!.keys()].filter(
            (id) => receipt.events![id].event === "LogMintReview"
          );
          const emittedId = {
            ...receipt.events![eventId[0]].args,
          };
          const reviewId = emittedId.reviewId.toNumber();

          const ao = await ethers.getContractAt(
            `AppraiserOrganization`,
            deployedOrgs[orgInd].AppraiserOrganization
          );
          const savedReview = await ao.s_reviews(reviewId);

          review.Author = user!.address;
          review.reviewId = reviewId;
          review.Timestamp = savedReview.unixtime.toNumber();
          review.IsVerified = savedReview.isVerified;

          reviews.push(review);

          console.log(
            `Review for ${o.Name} given by ${review.Author} ("${review.Review}", Rating = ${review.Rating})`
          );
          return review;
        })
      );
      o.Reviews = reviews;
      const sum: number = reviews.reduce((total, next) => {
        return total + Number(next.Rating);
      }, 0);
      o.AvgRating = divide(sum, reviews.length);
      return o;
    })
  );
  saveOrgsFrontendFiles(orgs);
  return orgs;
};

const deployOrgs = async (
  appraiser: Appraiser,
  reviewer: Reviewer,
  users: SignerWithAddress[]
) => {
  const signers = await ethers.getSigners();
  const admins = signers.slice(Number(`-${orgs.length.toString()}`));
  const updatedOrgs: Organization[] = [];
  await Promise.all(
    orgs.map(async (o: Organization, index) => {
      o.Admin = admins[index].address;
      const tx = await appraiser
        .connect(signers[0])
        .addOrganization(o.Name, o.Admin, o.URI, {
          gasLimit: 30000000,
        });
      const receipt = await tx.wait();
      const eventId = [...receipt.events!.keys()].filter(
        (id) => receipt.events![id].event === "LogAddOrganization"
      );
      const emittedId = {
        ...receipt.events![eventId[0]].args,
      };
      const orgId: BigNumber = emittedId.orgId;
      const org = await appraiser.s_deployedContracts(orgId);

      o.orgId = orgId.toNumber();
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

function saveOrgsFrontendFiles(deployedOrgs: Organization[]) {
  const fs = require("fs");

  fs.writeFileSync(
    helpersDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

function saveReviewsFrontendFiles(deployedOrgs: Organization[]) {
  const fs = require("fs");

  fs.writeFileSync(
    helpersDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

export { deployInitialOrganizations };
