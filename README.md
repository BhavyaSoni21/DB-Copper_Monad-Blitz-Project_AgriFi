# 🌾 AgriFi - Decentralized Agricultural Finance Platform

A blockchain-powered DeFi application enabling instant, transparent micro-loans for farmers with an integrated credit scoring system.

## 🎯 Project Overview

AgriFi revolutionizes agricultural financing by connecting farmers directly with lenders through smart contracts on the blockchain. The platform features a comprehensive loan approval workflow, credit score NFT system, and real-time tracking.

## ✨ Key Features

### For Farmers 🚜
- **Request Loans**: Submit loan requests with crop type, amount, and duration
- **Track Status**: Monitor loan status (Pending → Approved → Funded → Repaid)
- **Credit Score NFT**: Build on-chain credit history through successful repayments
- **Dashboard**: View all your loan requests and their current status

### For Lenders 💰
- **Approve/Reject Workflow**: Review and approve loan requests before funding
- **Fund Approved Loans**: Transfer ETH to farmers for approved loans
- **Track Investments**: Monitor all funded loans and repayment status
- **Three-Tab Portal**: 
  - Pending Loans (Review & Approve/Reject)
  - My Approved (Ready to Fund)
  - My Funded (Active Investments)

## 🏗️ Architecture

### Smart Contracts
- **AgriFiLoan.sol**: Main loan management with approval workflow
  - Loan request creation
  - Lender approval/rejection system
  - Funding mechanism with exact amount matching
  - Repayment tracking
  - Integration with credit NFT system

- **AgriFiCreditNFT.sol**: Credit score NFT system
  - Dynamic credit scores based on loan history
  - On-chain credit building
  - Reward mechanism for successful repayments

### Frontend (Next.js)
- **Farmer Pages**:
  - `/` - Request new loans
  - `/farmer-dashboard` - View all loan requests
  
- **Lender Pages**:
  - `/lender` - Approve/Reject & Fund loans (3-tab interface)
  - `/lender-dashboard` - View funded loan portfolio

## 🛠️ Tech Stack

- **Blockchain**: Ethereum-compatible (Hardhat local, Monad testnet ready)
- **Smart Contracts**: Solidity 0.8.20
- **Frontend**: Next.js 14.2.35, React, ethers.js 5.8.0
- **Styling**: Custom CSS with modern design
- **Dependencies**: OpenZeppelin, Chainlink (price feeds)
- **Development**: Hardhat, dotenv

## 📋 Prerequisites

- Node.js (v16+)
- MetaMask wallet extension
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/BhavyaSoni21/DB-Copper_Monad-Blitz-Project_AgriFi.git
cd DB-Copper_Monad-Blitz-Project_AgriFi
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
PRIVATE_KEY=your_private_key_here
```

### 4. Start Local Blockchain
```bash
npx hardhat node
```
Keep this terminal running.

### 5. Deploy Contracts (New Terminal)
```bash
# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Or deploy to Monad testnet (when available)
npx hardhat run scripts/deploy.js --network monad
```

Copy the deployed contract addresses.

### 6. Update Frontend Contract Addresses
Update the contract addresses in these files:
- `frontend/pages/index.js`
- `frontend/pages/farmer-dashboard.js`
- `frontend/pages/lender.js`
- `frontend/pages/lender-dashboard.js`

### 7. Start Frontend
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:3000`

## 🎮 Usage Guide

### MetaMask Setup
1. Add Localhost network:
   - Network Name: Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. Import a test account from Hardhat node output

### Farmer Workflow
1. Visit homepage (`/`)
2. Fill in loan details (amount, crop type, duration)
3. Click "Submit Loan Request"
4. View status in Farmer Dashboard

### Lender Workflow
1. Visit Lender Portal (`/lender`)
2. **Pending Tab**: Review loan requests
   - Click "Approve" to commit to funding
   - Click "Reject" to decline
3. **My Approved Tab**: View loans you approved
   - Click "Fund" to transfer ETH
4. **My Funded Tab**: Track your investments
   - Monitor repayment status

## 📁 Project Structure

```
AgriFi/
├── contracts/
│   ├── AgriFiLoan.sol           # Main loan contract
│   └── AgriFiCreditNFT.sol      # Credit score NFT
├── scripts/
│   └── deploy.js                # Deployment script
├── test/
│   ├── AgriFiLoan.test.js
│   └── AgriFiCreditNFT.test.js
├── frontend/
│   ├── pages/
│   │   ├── index.js             # Farmer loan request
│   │   ├── farmer-dashboard.js  # Farmer loans view
│   │   ├── lender.js            # Lender portal (3 tabs)
│   │   └── lender-dashboard.js  # Lender portfolio
│   ├── components/
│   │   └── Navbar.js            # Navigation bar
│   └── styles/
│       └── agrifi.css           # Custom styling
├── hardhat.config.js
├── package.json
└── README.md
```

## 🔐 Smart Contract Features

### Loan Status States
- **0 - Pending**: Awaiting lender approval
- **1 - Approved**: Lender approved, ready to fund
- **2 - Rejected**: Lender declined the loan
- **3 - Funded**: ETH transferred to farmer
- **4 - Repaid**: Farmer repaid the loan

### Security Features
- Lender address recorded on approval
- Only approving lender can fund the loan
- Exact amount matching required
- Reentrancy protection
- Access control for admin functions

## 🌐 Network Configuration

### Localhost (Development)
- Chain ID: 31337
- RPC: http://127.0.0.1:8545

### Monad Testnet (Target Deployment)
- Chain ID: 10143
- RPC: https://rpc.testnet.monad.xyz
- Explorer: https://testnet.monadscan.com

## 🧪 Testing

```bash
# Run contract tests
npx hardhat test

# Test specific file
npx hardhat test test/AgriFiLoan.test.js
```

## 🐛 Troubleshooting

### "Cannot read properties of undefined (reading 'slice')"
- Ensure wallet is connected before fetching loans
- Check that contract addresses are correct

### MetaMask Connection Issues
- Clear MetaMask cache
- Ensure correct network is selected
- Check that Hardhat node is running

### Contract Interaction Errors
- Verify contract addresses are updated in frontend
- Ensure sufficient ETH balance in wallet
- Check network and Chain ID match

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**DB-Copper** - Monad Blitz Hackathon Project

## 🔗 Links

- **GitHub**: [AgriFi Repository](https://github.com/BhavyaSoni21/DB-Copper_Monad-Blitz-Project_AgriFi)
- **Monad Docs**: [Monad Developer Documentation](https://docs.monad.xyz)

## 🙏 Acknowledgments

- OpenZeppelin for secure contract templates
- Chainlink for price feed integration
- Monad Labs for blockchain infrastructure
- Hardhat for development environment

---

Built with ❤️ for farmers and lenders worldwide 🌾

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