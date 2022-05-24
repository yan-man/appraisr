const orgs = require("../helpers/library.json");

const initOrgs = async (appraiser, reviewer) => {
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

  saveFrontendFiles(updatedOrgs);
  return deployedOrgs;
};

function saveFrontendFiles(deployedOrgs) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../helpers";

  fs.writeFileSync(
    contractsDir + "/library.json",
    JSON.stringify(deployedOrgs, undefined, 2)
  );
}

module.exports = { initOrgs };
