# AgriFi Frontend

Next.js frontend for the AgriFi Decentralized Agricultural Finance Platform.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update .env.local with your contract addresses
# NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=0x...
# NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS=0x...

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deploy

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Manual Deploy

```bash
# Build
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=<your_loan_contract_address>
NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS=<your_nft_contract_address>
```

**Important**: Environment variables in Next.js must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

### Contract Configuration

Contract addresses are managed in [`config/contracts.js`](config/contracts.js). The file uses environment variables with fallback to default addresses.

## 📁 Project Structure

```
frontend/
├── pages/               # Next.js pages
│   ├── index.js        # Farmer: Request loans
│   ├── farmer-dashboard.js
│   ├── lender.js       # Lender: Approve/Fund loans
│   └── lender-dashboard.js
├── components/         # React components
│   └── Navbar.js
├── config/            # Configuration files
│   └── contracts.js   # Contract addresses
├── styles/            # CSS files
│   └── agrifi.css
└── public/            # Static assets
```

## 🌐 Pages

- **`/`** - Farmer: Request new loan
- **`/farmer-dashboard`** - Farmer: View loan requests
- **`/lender`** - Lender: Approve/Reject/Fund loans (3-tab interface)
- **`/lender-dashboard`** - Lender: View funded portfolio

## 🔗 Smart Contract Integration

The frontend connects to smart contracts via ethers.js:

```javascript
import { ethers } from 'ethers';
import contracts from '../config/contracts';
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(
  contracts.loanContract,
  loanArtifact.abi,
  signer
);
```

## 📝 Deployment Checklist

- [ ] Smart contracts deployed
- [ ] Environment variables updated
- [ ] Build successful (`npm run build`)
- [ ] Deployed to Vercel/hosting
- [ ] MetaMask configured to correct network
- [ ] All features tested

## 🛠️ Troubleshooting

### "Contract not found"
- Verify contract addresses in `.env.local`
- Ensure MetaMask is on the correct network
- Check that contracts are deployed

### Build errors
- Run `npm install` to ensure dependencies are installed
- Check that artifacts folder exists with contract ABIs
- Verify all imports are correct

### MetaMask connection issues
- Click "Connect Wallet" in the app
- Approve connection in MetaMask popup
- Switch to the correct network in MetaMask

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ethers.js Documentation](https://docs.ethers.io/)
- [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md)

---

Built with ❤️ for farmers and lenders
