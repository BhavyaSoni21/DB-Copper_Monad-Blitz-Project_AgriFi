import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';
import contracts from '../config/contracts';

const MONAD_CHAIN_ID = 2016;

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
    // Try to get accounts silently first
    let accounts = await provider.send("eth_accounts", []);
    if (!accounts || accounts.length === 0) {
      // Only prompt if not already connected
      accounts = await provider.send("eth_requestAccounts", []);
    }
    const signer = provider.getSigner();
    const net = await provider.getNetwork();
    let networkName = net.name;
    if (net.chainId === MONAD_CHAIN_ID) networkName = "Monad Testnet";
    setNetwork(networkName);
    if (!contracts.loanContract || contracts.loanContract === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      setStatus("Please set NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS in environment variables");
      setLoading(false);
      return;
    }
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
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
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">🚜 Farmer Dashboard</h2>
          <div className="text-sm text-gray-600">
            <div className="border rounded px-3 py-1 bg-gray-50 inline-block">
              <span className="font-semibold">Network:</span> {network || 'Unknown'}
            </div>
          </div>
        </div>
        
        {loading && <div className="mb-4 text-center text-blue-600 font-semibold py-8">⏳ Loading your loans...</div>}
        
        {!loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">My Loan Requests ({loans.length})</h3>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
                onClick={fetchMyLoans}
              >
                🔄 Refresh
              </button>
            </div>
            
            {loans.length === 0 && (
              <div className="text-center text-gray-500 py-12 border rounded bg-gray-50">
                No loans found. Request a loan to get started!
              </div>
            )}
            
            {loans.map(loan => (
              <div key={loan.id} className="border rounded-lg p-4 mb-3 bg-white shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg text-gray-700">Loan #{loan.id.toString()}</div>
                  <div className={`px-3 py-1 rounded font-semibold text-sm ${
                    loan.repaid ? 'bg-green-100 text-green-700' : 
                    loan.funded ? 'bg-blue-100 text-blue-700' : 
                    loan.status === 1 ? 'bg-yellow-100 text-yellow-600' :
                    loan.status === 2 ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {loan.repaid ? '✓ Repaid' : 
                     loan.funded ? '💰 Funded' : 
                     loan.status === 1 ? '✅ Approved' :
                     loan.status === 2 ? '❌ Rejected' :
                     '📋 Pending'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Amount</div>
                    <div className="font-bold text-blue-700 text-lg">
                      {ethers.utils.formatEther(loan.amount)} ETH
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Duration</div>
                    <div className="font-bold text-green-700 text-lg">
                      {loan.durationInDays.toString()} days
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded col-span-2">
                    <div className="text-gray-600 text-xs">Crop Type</div>
                    <div className="font-semibold text-blue-700">
                      {loan.cropType}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {status && (
          <div className={`mt-6 p-4 rounded-lg font-semibold ${status.includes('Error') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
