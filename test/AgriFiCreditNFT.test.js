import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgriFiCreditNFT", function () {
  it("should deploy and set loan contract", async function () {
    const CreditNFT = await ethers.getContractFactory("AgriFiCreditNFT");
    const creditNFT = await CreditNFT.deploy();
    await creditNFT.deployed();

    const [owner] = await ethers.getSigners();
    expect(await creditNFT.owner()).to.equal(owner.address);

    await creditNFT.setLoanContract(owner.address);
    expect(await creditNFT.loanContract()).to.equal(owner.address);
  });
});
