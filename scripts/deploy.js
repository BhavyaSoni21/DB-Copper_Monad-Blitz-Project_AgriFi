const hre = require("hardhat");

async function main() {
  // Deploy Credit NFT first
  const [deployer] = await hre.ethers.getSigners();
  const CreditNFT = await hre.ethers.getContractFactory("AgriFiCreditNFT");
  const creditNFT = await CreditNFT.deploy(deployer.address);
  await creditNFT.deployed();
  console.log("AgriFiCreditNFT deployed to:", creditNFT.address);

  // Deploy Loan contract
  const Loan = await hre.ethers.getContractFactory("AgriFiLoan");
  // For testnet, use a mock price feed address or deployer address
  // In production, use actual Chainlink price feed address
  const mockPriceFeed = deployer.address; // Temporary mock for testing
  const loan = await Loan.deploy(creditNFT.address, mockPriceFeed, deployer.address);
  await loan.deployed();
  console.log("AgriFiLoan deployed to:", loan.address);

  // Set Loan contract address in CreditNFT
  await creditNFT.setLoanContract(loan.address);
  console.log("Loan contract set in CreditNFT.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
