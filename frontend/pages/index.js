import { useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';

export default function Farmer() {
  const [amount, setAmount] = useState("");
  const [cropType, setCropType] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);

  const MONAD_CHAIN_ID = 2016;

  async function requestLoan() {
    if (!window.ethereum) {
      setStatus("MetaMask required");
      return;
    }
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const net = await provider.getNetwork();
    let networkName = net.name;
    if (net.chainId === MONAD_CHAIN_ID) networkName = "Monad Testnet";
    setNetwork(networkName);
    // Deployed contract address
    const LOAN_CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    const contract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, loanArtifact.abi, signer);
    try {
      const tx = await contract.requestLoan(
        ethers.utils.parseEther(amount),
        cropType,
        parseInt(duration)
      );
      setStatus("Transaction pending...");
      await tx.wait();
      setStatus("Loan requested!");
    } catch (e) {
      if (e.code === "UNSUPPORTED_OPERATION" && e.operation === "getResolver") {
        setStatus(""); // Hide ENS error
      } else {
        setStatus(e.message);
      }
    }
    setLoading(false);
  }

  function validateInput() {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return false;
    if (!cropType) return false;
    if (!duration || isNaN(duration) || Number(duration) <= 0) return false;
    return true;
  }

  if (showOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-blue-700 mb-2">🌾 Welcome to AgriFi</h2>
            <p className="text-sm text-gray-500">Blockchain-Powered Agricultural Finance</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              AgriFi enables instant, on-chain micro-loans for farmers. Connect your wallet and follow simple steps to request funding for your crops.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">🚜</div>
              <div className="text-xs font-semibold text-green-700">For Farmers</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs font-semibold text-blue-700">Instant Loans</div>
            </div>
            <div className="text-center p-3 bg-purple-100 rounded-lg">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs font-semibold text-purple-700">Secure</div>
            </div>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full font-semibold transition" 
            onClick={() => setShowOnboarding(false)}
          >
            Get Started →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">🌾 Request Crop Loan</h2>
          <p className="text-sm text-gray-600">Fill in the details below to request funding</p>
          {network && (
            <div className="mt-2 border rounded px-3 py-1 bg-gray-50 inline-block text-xs">
              <span className="font-semibold">Network:</span> {network}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Loan Amount</label>
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="e.g., 2.5"
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">Amount in ETH</div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">🌾 Crop Type</label>
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="e.g., Wheat, Rice, Corn"
            value={cropType}
            onChange={e => setCropType(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">Type of crop you're growing</div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Duration</label>
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="e.g., 90"
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">Loan duration in days</div>
        </div>
        
        <button
          className={`bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-semibold transition ${!validateInput() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          onClick={requestLoan}
          disabled={!validateInput() || loading}
        >
          {loading ? '⏳ Processing...' : '📝 Submit Loan Request'}
        </button>
        
        {status && (
          <div className={`mt-4 p-3 rounded-lg font-semibold ${status.includes('requested') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {status}
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Your loan will be reviewed by lenders who can approve and fund it directly.
          </p>
        </div>
      </div>
    </div>
  );
}
