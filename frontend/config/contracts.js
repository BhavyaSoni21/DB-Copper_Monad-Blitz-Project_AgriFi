// Contract configuration - uses environment variables when available
const contracts = {
  loanContract: process.env.NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  creditNFTContract: process.env.NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

export default contracts;
