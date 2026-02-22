import { useState } from "react";
import { ethers } from "ethers";

export default function Farmer() {
  const [amount, setAmount] = useState("");
  const [cropType, setCropType] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("");

  async function requestLoan() {
    if (!window.ethereum) {
      setStatus("MetaMask required");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    // Replace with deployed contract address and ABI
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", LOAN_ABI, signer);
    try {
      const tx = await contract.requestLoan(
        ethers.utils.parseEther(amount),
        cropType,
        parseInt(duration)
      );
      await tx.wait();
      setStatus("Loan requested!");
    } catch (e) {
      setStatus(e.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Request Crop Loan</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Loan Amount (ETH)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Crop Type"
          value={cropType}
          onChange={e => setCropType(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Duration (days)"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={requestLoan}
        >
          Request Loan
        </button>
        {status && <div className="mt-4 text-green-600">{status}</div>}
      </div>
    </div>
  );
}
