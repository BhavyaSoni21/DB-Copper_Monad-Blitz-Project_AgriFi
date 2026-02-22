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
    // Replace with deployed contract address and ABI
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", loanArtifact.abi, signer);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
        <div className="bg-white p-8 rounded shadow w-96">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Welcome to AgriFi</h2>
          <p className="mb-4 text-gray-700">AgriFi enables instant, on-chain micro-loans for farmers. Connect your wallet and follow the simple steps to request a loan.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" onClick={() => setShowOnboarding(false)}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Request Crop Loan</h2>
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Loan Amount (ETH)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Crop Type"
          value={cropType}
          onChange={e => setCropType(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Duration (days)"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
        <button
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${!validateInput() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={requestLoan}
          disabled={!validateInput() || loading}
        >
          {loading ? 'Processing...' : 'Request Loan'}
        </button>
        {status && <div className="mt-4 text-blue-600">{status}</div>}
        <div className="mt-4 text-xs text-gray-500">Network: {network}</div>
      </div>
    </div>
  );
}
