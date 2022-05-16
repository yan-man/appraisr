const { expect } = require("chai");
const { ethers } = require("hardhat");

// export const shouldDeploy = () => {
//   context(`#deploy`, async function () {
//     it(`should revert if the token amount is not greater than zero`, async function () {
//       const amount = ethers.constants.Zero;

//       await expect(
//         this.lending
//           .connect(this.signers.alice)
//           .deposit(this.mocks.mockUsdc.address, amount)
//       ).to.be.revertedWith(`NeedsMoreThanZero`);
//     });
//   });
// };
