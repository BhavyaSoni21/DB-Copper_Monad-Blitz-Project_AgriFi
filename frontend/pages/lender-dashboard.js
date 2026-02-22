import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';
import contracts from '../config/contracts';

const MONAD_CHAIN_ID = 2016;

export default function LenderDashboard() {
  const [loans, setLoans] = useState([]);
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function fetchFundedLoans() {
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
        // Show loans that this address is the lender for (status >= 1 means approved or funded)
        if (loan.lender.toLowerCase() === myAddress.toLowerCase() && loan.status >= 1) {
          arr.push({ ...loan, id: i });
        }
      } catch {}
    }
    setLoans(arr);
    setLoading(false);
  }

  const getStatusText = (status) => {
    const statuses = ['Pending', 'Approved', 'Rejected', 'Funded', 'Repaid'];
    return statuses[status] || 'Unknown';
  };

  useEffect(() => {
    fetchFundedLoans();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-700 mb-2">💼 Lender Dashboard</h2>
          <div className="text-sm text-gray-600">
            <div className="border rounded px-3 py-1 bg-gray-50 inline-block">
              <span className="font-semibold">Network:</span> {network || 'Unknown'}
            </div>
          </div>
        </div>
        
        {loading && <div className="mb-4 text-center text-green-600 font-semibold py-8">⏳ Loading your funded loans...</div>}
        
        {!loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">My Funded Loans ({loans.length})</h3>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold"
                onClick={fetchFundedLoans}
              >
                🔄 Refresh
              </button>
            </div>
            
            {loans.length === 0 && (
              <div className="text-center text-gray-500 py-12 border rounded bg-gray-50">
                No loans found. Visit the Lender Portal to approve and fund loans!
              </div>
            )}
            
            {loans.map(loan => (
              <div key={loan.id} className="border rounded-lg p-4 mb-3 bg-white shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg text-gray-700">Loan #{loan.id.toString()}</div>
                  <div className={`px-3 py-1 rounded font-semibold text-sm ${
                    loan.repaid ? 'bg-green-100 text-green-700' : 
                    loan.status === 3 ? 'bg-blue-100 text-blue-700' : 
                    loan.status === 1 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getStatusText(loan.status)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">👤 Farmer:</span>
                    <span className="font-mono text-xs">
                      {loan.farmer ? `${loan.farmer.slice(0, 10)}...${loan.farmer.slice(-8)}` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Loan Amount</div>
                    <div className="font-bold text-green-700 text-lg">
                      {ethers.utils.formatEther(loan.amount)} ETH
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Duration</div>
                    <div className="font-bold text-blue-700 text-lg">
                      {loan.durationInDays.toString()} days
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Crop Type</div>
                    <div className="font-semibold text-green-700">
                      {loan.cropType}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-gray-600 text-xs">Repayment</div>
                    <div className={`font-semibold ${loan.repaid ? 'text-green-700' : 'text-blue-700'}`}>
                      {loan.repaid ? '✓ Complete' : '⏳ Pending'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {status && (
          <div className={`mt-6 p-4 rounded-lg font-semibold ${status.includes('Error') || status.includes('required') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
