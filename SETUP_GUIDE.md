# Event Indexing Setup (The Graph)

1. Install The Graph CLI:
   npm install -g @graphprotocol/graph-cli

2. Initialize a subgraph project:
   graph init --contract-name AgriFiLoan --product hosted-service <your-github-username>/agrifi-loan

3. Define subgraph.yaml with contract address and events (LoanRequested, LoanFunded, LoanRepaid).

4. Write mappings in src/mapping.ts to handle event data.

5. Deploy subgraph:
   graph deploy --product hosted-service <your-github-username>/agrifi-loan

# Upgradeable Contract Setup (OpenZeppelin Upgrades)

1. Install OpenZeppelin Upgrades:
   npm install @openzeppelin/hardhat-upgrades

2. Refactor AgriFiLoan to use Initializable and UUPSUpgradeable:
   - import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"
   - import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol"

3. Deploy proxy:
   npx hardhat run scripts/deploy.js --network monad

4. Upgrade contract:
   npx hardhat run scripts/upgrade.js --network monad

# ABI Version Control

- Store ABIs in abis/ folder, name with version (e.g., AgriFiLoan_v1.json).
- Reference correct ABI in frontend and scripts.
- Track changes with git.
