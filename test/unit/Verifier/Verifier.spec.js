const { expect } = require("chai");
const { ethers } = require("hardhat");

const shouldDeploy = () => {
  context(`# deploy contract`, async function () {
    it("*Happy Path: Should set the right owner", async function () {
      expect(await this.verifier.owner()).to.equal(this.users.deployer.address);
    });

    it("Should mint default VERIFIER NFTs and send them to org address", async function () {
      const verifier = await this.verifier.VERIFIER();
      expect(
        await this.verifier.balanceOf(this.orgs.wacarnolds.address, verifier)
      ).to.equal(Math.pow(10, 3));
    });

    it("Should set orgId in constructor", async function () {
      expect(await this.verifier.orgId()).to.equal(
        this.constructorParams.orgId
      );
    });

    it("Should set ADMIN_ROLE in constructor", async function () {
      expect(
        await this.verifier.hasCustomRole(
          "ADMIN_ROLE",
          this.constructorParams.addr
        )
      ).to.equal(true);
    });
    it("Should set Appraiser contract address", async function () {
      expect(await this.verifier.s_appraiserContract()).to.equal(
        this.users.deployer.address
      );
    });
  });
};

const shouldSetContractAddress = () => {
  context(`# setAppraiserContractAddress`, async function () {
    it("should allow transfers of VERIFIER token only from owner", async function () {
      const tx = await this.verifier.setAppraiserContractAddress(
        this.signers[15].address
      );
      await tx.wait();
      expect(await this.verifier.s_appraiserContract()).to.equal(
        this.signers[15].address
      );
    });
  });
};

const shouldMintAndTransferAndBurnNFT = () => {
  context(`# transfer NFTs`, async function () {
    describe("...Set up", async function () {
      beforeEach(async function () {
        this.VERIFIER = await this.verifier.VERIFIER();
        this.appraiserContract = await this.verifier.s_appraiserContract();
      });

      it("should batch mint 5 VERIFIER NFTs to dave", async function () {
        const tokenAmount = 5;
        const tx = await this.verifier.mintBatch(
          [this.VERIFIER],
          [tokenAmount],
          this.users.dave.address
        );
        await tx.wait();
        expect(
          await this.verifier.balanceOf(this.users.dave.address, this.VERIFIER)
        ).to.equal(tokenAmount);
      });

      describe("...After 5 VERIFIER NFTs are minted to a random user dave", async function () {
        beforeEach(async function () {
          this.tokenAmount = 5;
          this.tx = await this.verifier.mintBatch(
            [this.VERIFIER],
            [this.tokenAmount],
            this.users.dave.address
          );
          await this.tx.wait();
        });
        it("should not allow transfers of VERIFIER token from non-owner/admin dave", async function () {
          await expect(
            this.verifier
              .connect(this.users.dave)
              .safeTransferFrom(
                this.users.dave.address,
                this.users.prince.address,
                this.VERIFIER,
                1,
                []
              )
          ).to.be.revertedWith(`OnlyAdminCanTransferVerifierNFT`);
        });
        it(`Should not allow transfers of VERIFIER token from non-approved`, async function () {
          await expect(
            this.verifier
              .connect(this.users.deployer)
              .safeTransferFrom(
                this.users.dave.address,
                this.users.prince.address,
                this.VERIFIER,
                1,
                []
              )
          ).to.be.revertedWith(`ERC1155__NotOwnerNorApproved`);
        });
      });

      describe(`...After 1 VERIFIER NFT is sent to ashylarry`, async function () {
        beforeEach(async function () {
          this.tokenAmount = 1;
          this.tx = await this.verifier
            .connect(this.orgs.wacarnolds)
            .safeTransferFrom(
              this.orgs.wacarnolds.address,
              this.users.ashylarry.address,
              this.VERIFIER,
              this.tokenAmount,
              []
            );
          await this.tx.wait();
        });
        it(`Should not allow transfers of VERIFIER token from non-owner/admin dave`, async function () {
          await expect(
            this.verifier
              .connect(this.users.ashylarry)
              .safeTransferFrom(
                this.users.ashylarry.address,
                this.users.prince.address,
                this.VERIFIER,
                1,
                []
              )
          ).to.be.revertedWith(`OnlyAdminCanTransferVerifierNFT`);
        });
        it(`Should not allow transfers of VERIFIER token from non-approved`, async function () {
          await expect(
            this.verifier
              .connect(this.users.deployer)
              .safeTransferFrom(
                this.users.ashylarry.address,
                this.users.prince.address,
                this.VERIFIER,
                1,
                []
              )
          ).to.be.revertedWith(`ERC1155__NotOwnerNorApproved`);
        });
        // it.only(`Should not burn token from Appraiser contract address`, async function () {
        //   await expect(
        //     this.verifier
        //       .connect(this.users.)
        //       .burnVerifierForAddress(this.users.ashylarry.address)
        //   ).to.be.revertedWith(`InvalidBurnerAddress`);
        // });
      });
    });
  });
};

module.exports = {
  shouldDeploy,
  shouldSetContractAddress,
  shouldMintAndTransferAndBurnNFT,
};
