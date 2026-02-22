import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';

const MONAD_CHAIN_ID = 2016;
const LOAN_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with actual address

export default function FarmerDashboard() {
  const [loans, setLoans] = useState([]);
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function fetchMyLoans() {
    setLoading(true);
    if (!window.ethereum) {
      setStatus("MetaMask required");
      setLoading(false);
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const net = await provider.getNetwork();
    let networkName = net.name;
    if (net.chainId === MONAD_CHAIN_ID) networkName = "Monad Testnet";
    setNetwork(networkName);
    const contract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, loanArtifact.abi, signer);
    const myAddress = await signer.getAddress();
    let arr = [];
    for (let i = 0; i < 20; i++) {
      try {
        const loan = await contract.getLoan(i);
        if (loan.farmer.toLowerCase() === myAddress.toLowerCase()) arr.push({ ...loan, id: i });
      } catch {}
    }
    setLoans(arr);
    setLoading(false);
  }

  useEffect(() => {
    fetchMyLoans();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Farmer Dashboard</h2>
        <div className="mb-4 text-xs text-gray-500">Network: {network}</div>
        {loading && <div className="mb-4 text-blue-600">Loading...</div>}
        {loans.length === 0 && !loading && <div>No loans found.</div>}
        {loans.map(loan => (
          <div key={loan.id} className="border p-2 mb-2 rounded bg-blue-100">
            <div className="font-semibold">Loan ID: {loan.id}</div>
            <div>Amount: {ethers.utils.formatEther(loan.amount)} ETH</div>
            <div>Crop: {loan.cropType}</div>
            <div>Duration: {loan.durationInDays} days</div>
            <div>Funded: {loan.funded ? "Yes" : "No"}</div>
            <div>Repaid: {loan.repaid ? "Yes" : "No"}</div>
          </div>
        ))}
        {status && <div className="mt-4 text-blue-600">{status}</div>}
      </div>
    </div>
  );
}
