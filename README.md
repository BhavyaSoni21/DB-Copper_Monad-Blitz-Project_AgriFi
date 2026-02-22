# AgriFi – On-Chain Micro-Lending for Farmers

## Project Structure
- `contracts/` — Solidity smart contracts
- `scripts/` — Deployment scripts
- `frontend/` — React frontend
- `test/` — Contract tests

## Step-by-Step Deployment Guide

1. Clone the repo:
   ```bash
   git clone https://github.com/BhavyaSoni21/DB-Copper_Monad-Blitz-Project_AgriFi.git
   cd AgriFi
   ```
2. Install dependencies:
   ```bash
   npm install --prefix frontend
   npm install --save-dev hardhat @openzeppelin/contracts ethers dotenv
   ```
3. Set up `.env` in the root directory:
   - Add your Monad Testnet private key:
     ```
     PRIVATE_KEY=your_private_key_here
     ```
4. Compile contracts:
   ```bash
   npx hardhat compile
   ```
5. Deploy contracts to Monad Testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network monad
   ```
   - Note deployed contract addresses for frontend integration.
6. Update frontend contract addresses and ABIs in `pages/index.js` and `pages/lender.js`.
7. Start frontend:
   ```bash
   npm run dev --prefix frontend
   ```
8. Run tests:
   ```bash
   npx hardhat test
   ```
9. Demo workflow:
   - Farmer requests loan (index.js)
   - Lender funds loan (lender.js)
   - Farmer repays loan, receives Credit NFT
   - Credit score updates and NFT confirmation shown

## Demo Pitch & Monad Benefits

- AgriFi enables instant, on-chain micro-loans for farmers, with repayments aligned to harvest cycles.
- Every successful repayment mints a Credit NFT, building verifiable credit history.
- Monad’s ultra-fast block times and low gas fees make micro-lending scalable and affordable.
- No backend, no database—just pure smart contracts and events.

## Innovation Ideas

- Crop insurance NFT for repaid loans
- Oracle integration for crop price data
- Gamified credit score badges
- Group loans for farming cooperatives

## Steps to prepare your project repo:

1. Visit the `monad-blitz-mumbai` repo (link [here](https://github.com/monad-developers/monad-blitz-mumbai)) and fork it.

![1.png](/screenshots/1.png)

2. Give it your project name, a one-liner description, make sure you are forking `main` branch and click `Create Fork`

![2.png](/screenshots/2.png)

3. In your fork you can make all the changes you want, add code of your project, create branches, add information to `README.md` , you can change anything and everything.