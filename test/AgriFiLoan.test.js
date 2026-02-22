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

describe("AgriFiLoan - Revert Conditions", function () {
  let creditNFT, loan, farmer, lender;
  beforeEach(async function () {
    const CreditNFT = await ethers.getContractFactory("AgriFiCreditNFT");
    creditNFT = await CreditNFT.deploy();
    await creditNFT.deployed();
    const Loan = await ethers.getContractFactory("AgriFiLoan");
    loan = await Loan.deploy(creditNFT.address);
    await loan.deployed();
    await creditNFT.setLoanContract(loan.address);
    [farmer, lender] = await ethers.getSigners();
    await loan.connect(farmer).requestLoan(ethers.utils.parseEther("1"), "Wheat", 30);
  });

  it("should revert if loan is funded twice", async function () {
    await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    await expect(
      loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Already funded");
  });

  it("should revert if borrower funds own loan", async function () {
    await expect(
      loan.connect(farmer).fundLoan(0, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Borrower cannot fund own loan");
  });

  it("should revert if repayment is triggered twice", async function () {
    await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    await loan.connect(farmer).repayLoan(0, { value: ethers.utils.parseEther("1") });
    await expect(
      loan.connect(farmer).repayLoan(0, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Already repaid");
  });

  it("should revert if repayment is by non-farmer", async function () {
    await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    await expect(
      loan.connect(lender).repayLoan(0, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Only farmer can repay");
  });

  it("should revert if funding with wrong amount", async function () {
    await expect(
      loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("2") })
    ).to.be.revertedWith("Incorrect amount");
  });

  it("should revert if repayment with wrong amount", async function () {
    await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    await expect(
      loan.connect(farmer).repayLoan(0, { value: ethers.utils.parseEther("2") })
    ).to.be.revertedWith("Incorrect repayment amount");
  });
});

describe("AgriFiLoan - Default Scenarios", function () {
  let creditNFT, loan, farmer, lender;
  beforeEach(async function () {
    const CreditNFT = await ethers.getContractFactory("AgriFiCreditNFT");
    creditNFT = await CreditNFT.deploy();
    await creditNFT.deployed();
    const Loan = await ethers.getContractFactory("AgriFiLoan");
    loan = await Loan.deploy(creditNFT.address);
    await loan.deployed();
    await creditNFT.setLoanContract(loan.address);
    [farmer, lender] = await ethers.getSigners();
  });

  it("should have no loans by default", async function () {
    expect(await loan.loans.length).to.equal(0);
  });

  it("should allow loan request and check default values", async function () {
    await loan.connect(farmer).requestLoan(ethers.utils.parseEther("1"), "Wheat", 30);
    const loanData = await loan.loans(0);
    expect(loanData.funded).to.equal(false);
    expect(loanData.repaid).to.equal(false);
    expect(loanData.lender).to.equal(ethers.constants.AddressZero);
  });
});

describe("AgriFiLoan - Gas Limits", function () {
  let creditNFT, loan, farmer, lender;
  beforeEach(async function () {
    const CreditNFT = await ethers.getContractFactory("AgriFiCreditNFT");
    creditNFT = await CreditNFT.deploy();
    await creditNFT.deployed();
    const Loan = await ethers.getContractFactory("AgriFiLoan");
    loan = await Loan.deploy(creditNFT.address);
    await loan.deployed();
    await creditNFT.setLoanContract(loan.address);
    [farmer, lender] = await ethers.getSigners();
    await loan.connect(farmer).requestLoan(ethers.utils.parseEther("1"), "Wheat", 30);
  });

  it("should estimate gas for funding loan", async function () {
    const tx = await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    const receipt = await tx.wait();
    expect(receipt.gasUsed.toNumber()).to.be.lessThan(200000);
  });

  it("should estimate gas for repaying loan", async function () {
    await loan.connect(lender).fundLoan(0, { value: ethers.utils.parseEther("1") });
    const tx = await loan.connect(farmer).repayLoan(0, { value: ethers.utils.parseEther("1") });
    const receipt = await tx.wait();
    expect(receipt.gasUsed.toNumber()).to.be.lessThan(250000);
  });
});

// Testnet verification documentation
// To verify contracts on testnet, use Hardhat's verify task:
// npx hardhat verify --network <network> <contract_address> <constructor_args>
// Example:
// npx hardhat verify --network goerli 0x123... <creditNFT_address>
// npx hardhat verify --network goerli 0x456... <creditNFT_address>
// Ensure contracts are verified after deployment for transparency.
