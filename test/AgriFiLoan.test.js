import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgriFiLoan", function () {
  it("should deploy and allow loan requests", async function () {
    const CreditNFT = await ethers.getContractFactory("AgriFiCreditNFT");
    const creditNFT = await CreditNFT.deploy();
    await creditNFT.deployed();

    const Loan = await ethers.getContractFactory("AgriFiLoan");
    const loan = await Loan.deploy(creditNFT.address);
    await loan.deployed();

    await creditNFT.setLoanContract(loan.address);

    const [farmer] = await ethers.getSigners();
    await loan.requestLoan(ethers.utils.parseEther("1"), "Wheat", 30);
    const loanData = await loan.loans(0);
    expect(loanData.farmer).to.equal(farmer.address);
    expect(loanData.amount).to.equal(ethers.utils.parseEther("1"));
  });
});
