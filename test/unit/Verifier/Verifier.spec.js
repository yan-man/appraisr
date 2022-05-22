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

    it("Should set s_orgId in constructor", async function () {
      expect(await this.verifier.s_orgId()).to.equal(
        this.constructorParams.orgId
      );
    });

    it("Should set ADMIN_ROLE in constructor", async function () {
      expect(await this.verifier.isAdmin(this.constructorParams.addr)).to.equal(
        true
      );
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
    it("should allow owner to set AppraiserContractAddress", async function () {
      const tx = await this.verifier.setAppraiserContractAddress(
        this.users.prince.address
      );
      await tx.wait();
      expect(await this.verifier.s_appraiserContract()).to.equal(
        this.users.prince.address
      );
    });

    it("should not allow dave to set AppraiserContractAddress", async function () {
      await expect(
        this.verifier
          .connect(this.users.dave)
          .setAppraiserContractAddress(this.users.prince.address)
      ).to.be.reverted;
    });
  });
};

const shouldMintAndTransferAndBurnNFT = () => {
  context(`# transfer NFTs`, async function () {
    describe("...Set up", async function () {
      beforeEach(async function () {
        this.VERIFIER = await this.verifier.VERIFIER();
        this.appraiserContractAddress =
          await this.verifier.s_appraiserContract();
      });

      it("should admin batch mint 5 VERIFIER NFTs to dave", async function () {
        const tokenAmount = 5;
        const tx = await this.verifier.adminMintBatch(
          [this.VERIFIER],
          [tokenAmount],
          this.users.dave.address
        );
        await tx.wait();
        expect(
          await this.verifier.balanceOf(this.users.dave.address, this.VERIFIER)
        ).to.equal(tokenAmount);
      });

      it("should admin batch mint 5 VERIFIER NFTs to dave", async function () {
        const tokenAmount = 5;
        const tx = await this.verifier.adminMintBatch(
          [this.VERIFIER],
          [tokenAmount],
          this.users.dave.address
        );
        await tx.wait();
        expect(
          await this.verifier.balanceOf(this.users.dave.address, this.VERIFIER)
        ).to.equal(tokenAmount);
      });

      it.only("should not batch mint to dave from non-WacArnolds admin", async function () {
        await expect(
          this.verifier
            .connect(this.users.ashylarry)
            .mintBatch(this.users.dave.address)
        ).to.be.revertedWith(`Verifier__OnlyAdminCanMintNFT`);
      });

      it("should not batch mint from non-WacArnolds admin with 0 funds", async function () {
        await expect(
          this.verifier
            .connect(this.orgs.wacarnolds)
            .mintBatch(this.users.dave.address)
        ).to.be.revertedWith(`Verifier__InvalidMsgValue`);
      });

      it("should not batch mint from non-WacArnolds admin with insufficient funds", async function () {
        const FLOOR_PRICE = await this.verifier.FLOOR_PRICE();
        await expect(
          this.verifier
            .connect(this.orgs.wacarnolds)
            .mintBatch(this.users.dave.address, {
              value: ethers.utils.parseUnits(
                FLOOR_PRICE.sub(1).toString(),
                "wei"
              ),
            })
        ).to.be.revertedWith(`Verifier__InvalidMsgValue`);
      });

      it("should not be reverted to batch mint from non-WacArnolds admin with valid funds", async function () {
        const FLOOR_PRICE = await this.verifier.FLOOR_PRICE();
        await expect(
          this.verifier
            .connect(this.orgs.wacarnolds)
            .mintBatch(this.users.dave.address, {
              value: ethers.utils.parseUnits(FLOOR_PRICE.toString(), "wei"),
            })
        ).to.not.be.reverted;
      });

      it.only("should batch mint 5 VERIFIER NFTs to dave from WacArnolds admin with valid funds", async function () {
        const tokenAmount = 5;

        const FLOOR_PRICE = await this.verifier.FLOOR_PRICE();
        const tx = await this.verifier
          .connect(this.orgs.wacarnolds)
          .mintBatch(this.users.dave.address, {
            value: ethers.utils.parseUnits(
              FLOOR_PRICE.mul(tokenAmount).toString(),
              "wei"
            ),
          });
        await tx.wait();
        expect(
          await this.verifier.balanceOf(this.users.dave.address, this.VERIFIER)
        ).to.equal(tokenAmount);
      });

      describe("...After 5 VERIFIER NFTs are minted to a random user dave", async function () {
        beforeEach(async function () {
          this.tokenAmount = 5;
          this.tx = await this.verifier.adminMintBatch(
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
          ).to.be.revertedWith(`Verifier__OnlyAdminCanTransferVerifierNFT`);
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

      it(`should allow transfer of tokens from admin to ashylarry`, async function () {
        const tokenAmount = 2;
        const tx = await this.verifier
          .connect(this.orgs.wacarnolds)
          .safeTransferFrom(
            this.orgs.wacarnolds.address,
            this.users.ashylarry.address,
            this.VERIFIER,
            tokenAmount,
            []
          );
        await tx.wait();
        expect(
          await this.verifier.balanceOf(
            this.orgs.wacarnolds.address,
            this.VERIFIER
          )
        ).to.equal(ethers.BigNumber.from("1000").sub(tokenAmount));
        expect(
          await this.verifier.balanceOf(
            this.users.ashylarry.address,
            this.VERIFIER
          )
        ).to.equal(tokenAmount);
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
          ).to.be.revertedWith(`Verifier__OnlyAdminCanTransferVerifierNFT`);
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
        it(`Should not burn token from Appraiser contract address if not connected to owner`, async function () {
          await expect(
            this.verifier
              .connect(this.orgs.wacarnolds)
              .burnVerifierForAddress(this.users.ashylarry.address)
          ).to.be.revertedWith(`Verifier__InvalidBurnerAddress`);
        });

        describe("...After Appraiser contract address has been set", async function () {
          beforeEach(async function () {
            await this.verifier.setAppraiserContractAddress(
              this.users.prince.address
            );
          });

          it(`Should burn token from Appraiser contract address if connected to s_appraiserContract`, async function () {
            await expect(
              this.verifier
                .connect(this.users.prince)
                .burnVerifierForAddress(this.users.ashylarry.address)
            ).to.not.be.reverted;
          });

          it(`Should burn token from Appraiser contract address if connected to s_appraiserContract`, async function () {
            await this.verifier
              .connect(this.users.prince)
              .burnVerifierForAddress(this.users.ashylarry.address);

            expect(
              await this.verifier.balanceOf(
                this.users.ashylarry.address,
                this.VERIFIER
              )
            ).to.equal(0);
          });
        });
      });
    });
  });
};

const shouldSupportInterface = () => {
  context(`# transfer NFTs`, async function () {
    it(`...should supportsInterface`, async function () {
      expect(await this.verifier.supportsInterface(`0x12340000`)).to.equal(
        false
      );
    });
  });
};
module.exports = {
  shouldDeploy,
  shouldSetContractAddress,
  shouldMintAndTransferAndBurnNFT,
  shouldSupportInterface,
};
