# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub account
- Deployed smart contracts (get contract addresses after deployment)

## Step 1: Push Code to GitHub

```bash
cd c:\Projects\Monad-Blitz\AgriFi\AgriFi
git init
git add .
git commit -m "Initial commit - AgriFi DeFi Platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=<your_deployed_loan_contract_address>
     NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS=<your_deployed_nft_contract_address>
     ```

6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? agrifi-defi
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS
# Paste your loan contract address when prompted

vercel env add NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS
# Paste your NFT contract address when prompted

# Deploy to production
vercel --prod
```

## Step 3: Update Contract Addresses

After deploying your smart contracts, update the environment variables:

### In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Edit the variables with your deployed contract addresses:
   - `NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS`: Your AgriFiLoan contract address
   - `NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS`: Your AgriFiCreditNFT contract address

4. Redeploy: Deployments → Click "..." → Redeploy

### Using CLI:
```bash
vercel env rm NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS production
vercel env add NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS production
# Enter new address

vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Deployment Checklist

- [ ] Smart contracts deployed (localhost/testnet/mainnet)
- [ ] Contract addresses noted
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Frontend deployed successfully
- [ ] MetaMask configured to correct network
- [ ] Test all features (request loan, approve, fund)

## Network Configuration

Make sure users' MetaMask is connected to the same network where your contracts are deployed:

- **Local Development**: `http://127.0.0.1:8545` (Chain ID: 31337)
- **Monad Testnet**: `https://rpc.testnet.monad.xyz` (Chain ID: 2016)
- **Other Networks**: Update as needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `artifacts` folder is accessible (may need to copy ABIs to frontend)

### Contract Not Found
- Verify environment variables are set correctly
- Check that contract addresses are correct
- Ensure network matches deployed contracts

### MetaMask Issues
- Switch to correct network in MetaMask
- Add custom network if using testnet
- Ensure sufficient balance for gas fees

## Useful Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel list

# Remove a deployment
vercel remove <deployment-url>

# Check environment variables
vercel env ls
```

## Production Considerations

1. **Security**:
   - Audit smart contracts before mainnet deployment
   - Use hardware wallet for deployment
   - Test thoroughly on testnet first

2. **Performance**:
   - Enable caching in Vercel
   - Optimize images and assets
   - Use ISR/SSG where applicable

3. **Monitoring**:
   - Set up Vercel Analytics
   - Monitor contract events
   - Track gas usage

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)

---

**Your AgriFi Application**: Once deployed, share the Vercel URL with users!
