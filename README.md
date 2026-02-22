# 🌾 AgriFi - Decentralized Agricultural Finance Platform

A blockchain-powered DeFi application enabling instant, transparent micro-loans for farmers with an integrated credit scoring system.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install && cd frontend && npm install && cd ..

# 2. Start local blockchain (Terminal 1)
npx hardhat node

# 3. Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# 4. Start frontend (Terminal 3)
cd frontend && npm run dev
```

Then open `http://localhost:3000` and connect MetaMask to localhost (Chain ID: 31337).

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

**Blockchain & Smart Contracts:**
- Solidity 0.8.20
- Hardhat (development & testing)
- OpenZeppelin (secure contract templates)
- Chainlink (price feeds integration)

**Frontend:**
- Next.js 14.2.35
- React
- ethers.js 5.8.0
- Custom CSS with modern responsive design

**Infrastructure:**
- Ethereum-compatible chains (Local Hardhat, Monad testnet ready)
- Vercel (frontend deployment)
- Environment-based configuration system

**Development Tools:**
- dotenv (environment management)
- Git version control
- MetaMask integration

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

### 6. Configure Frontend Contract Addresses

#### Option A: Environment Variables (Recommended for Production)
Create `.env.local` in the `frontend` directory:
```env
NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=<your_loan_contract_address>
NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS=<your_credit_nft_contract_address>
```

#### Option B: Update Config File (Quick Development)
Update `frontend/config/contracts.js` with your deployed contract addresses:
```javascript
const contracts = {
  loanContract: "<your_loan_contract_address>",
  creditNFTContract: "<your_credit_nft_contract_address>"
};
```

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
│   ├── config/
│   │   └── contracts.js         # Centralized contract addresses
│   ├── styles/
│   │   └── agrifi.css           # Custom styling
│   └── .env.local               # Environment variables (create this)
├── hardhat.config.js
├── package.json
├── README.md
├── SETUP_GUIDE.md               # Advanced setup (The Graph, Upgrades)
└── VERCEL_DEPLOYMENT.md         # Production deployment guide
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

## ⚙️ Configuration

### Contract Address Management
The project uses a centralized configuration system in `frontend/config/contracts.js`:

```javascript
const contracts = {
  loanContract: process.env.NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  creditNFTContract: process.env.NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};
```

**Benefits:**
- Single source of truth for contract addresses
- Environment variable support for different deployments
- Fallback addresses for local development
- Easy to update across all pages

### Environment Variables
Create `frontend/.env.local` for environment-specific configuration:
```env
NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=0xYourLoanContractAddress
NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
```

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

## 🌐 Production Deployment

### Deploy to Vercel
For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

**Quick Deploy:**
1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS`
5. Deploy!

### Deploy Smart Contracts to Monad Testnet
```bash
npx hardhat run scripts/deploy.js --network monad
```
Update the contract addresses in your frontend environment variables.

## 🐛 Troubleshooting

### Port Already in Use (Hardhat Node)
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
```bash
# Linux/Mac
lsof -ti:8545 | xargs kill -9
```

### "Cannot read properties of undefined (reading 'slice')"
- Ensure wallet is connected before fetching loans
- Check that contract addresses are correct in `config/contracts.js` or `.env.local`
- Verify MetaMask is on the correct network

### MetaMask Connection Issues
- Clear MetaMask cache and reconnect
- Ensure correct network is selected (Chain ID: 31337 for localhost)
- Check that Hardhat node is running
- Reset account in MetaMask (Settings → Advanced → Reset Account)

### Contract Interaction Errors
- Verify contract addresses are updated in `frontend/config/contracts.js`
- Ensure sufficient ETH balance in wallet
- Check network and Chain ID match
- Redeploy contracts if you restarted Hardhat node

### Frontend Build Issues
- Delete `.next` folder and `node_modules`, then reinstall:
  ```bash
  cd frontend
  rm -rf .next node_modules
  npm install
  npm run dev
  ```

## 🔬 Advanced Features

For advanced setup and features, see [SETUP_GUIDE.md](SETUP_GUIDE.md):
- **The Graph Integration**: Event indexing for efficient data queries
- **Upgradeable Contracts**: Using OpenZeppelin UUPS proxy pattern
- **ABI Version Control**: Managing contract interface versions

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
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Advanced features
- **Deployment Guide**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Production deployment

## 📚 Documentation

- **[README.md](README.md)**: Main documentation (this file)
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Advanced setup (The Graph, Upgradeable Contracts, ABI versioning)
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**: Production deployment on Vercel
- **[ABI_VERSION_CONTROL.md](ABI_VERSION_CONTROL.md)**: ABI management and versioning

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

## 💡 Key Innovations

### Financial Inclusion
- **Instant Micro-Loans**: Enable farmers to access capital without traditional banking barriers
- **Transparent Process**: All transactions visible on-chain for accountability
- **Credit History**: Build verifiable on-chain credit through successful repayments
- **Harvest-Aligned Repayments**: Loan terms designed around agricultural cycles

### Technical Excellence
- **No Backend Required**: Pure smart contract architecture using events for data
- **Centralized Configuration**: Single source of truth for contract addresses
- **Environment-Based Deployment**: Easy migration between local, testnet, and mainnet
- **Monad-Optimized**: Leverages Monad's ultra-fast block times and low gas fees for scalable micro-lending

### User Experience
- **Three-Stage Lender Workflow**: Clear approval → funding → tracking process  
- **Real-Time Status Updates**: Track loan lifecycle from request to repayment
- **Credit NFT Rewards**: Gamified credit building with NFT minting on successful repayments
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎯 Future Roadmap

- **Crop Insurance NFTs**: Protection for farmers based on loan repayment history
- **Oracle Integration**: Real-time crop price data for dynamic loan amounts
- **Credit Score Badges**: Tiered credit system with visual badges and benefits
- **Cooperative Loans**: Group lending for farming cooperatives
- **Multi-Chain Support**: Deploy to additional EVM-compatible chains
- **Advanced Analytics**: Dashboard with historical data and trends

---

## 📞 Contact & Support

**Team DB-Copper** - Monad Blitz Hackathon Project

For questions, issues, or contributions:
- Create an issue on [GitHub](https://github.com/BhavyaSoni21/DB-Copper_Monad-Blitz-Project_AgriFi/issues)
- Check existing documentation in SETUP_GUIDE.md and VERCEL_DEPLOYMENT.md
- Review the comprehensive guides above for troubleshooting

---

*Making agricultural finance accessible, transparent, and efficient through blockchain technology.*