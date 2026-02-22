import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';
import contracts from '../config/contracts';

export default function Lender() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [myFundedLoans, setMyFundedLoans] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");
  const [myAddress, setMyAddress] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, funded

  async function fetchLoans() {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setMyAddress(address);
    const net = await provider.getNetwork();
    setNetwork(net.name);
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    
    let pending = [];
    let approved = [];
    let funded = [];
    
    for (let i = 0; i < 50; i++) {
      try {
        const loan = await contract.getLoan(i);
        const loanData = { ...loan, id: i };
        
        // Status: 0=Pending, 1=Approved, 2=Rejected, 3=Funded, 4=Repaid
        if (loan.status === 0) {
          pending.push(loanData);
        } else if (loan.status === 1 && loan.lender.toLowerCase() === address.toLowerCase()) {
          approved.push(loanData);
        } else if ((loan.status === 3 || loan.status === 4) && loan.lender.toLowerCase() === address.toLowerCase()) {
          funded.push(loanData);
        }
      } catch {}
    }
    
    setPendingLoans(pending);
    setApprovedLoans(approved);
    setMyFundedLoans(funded);
    setLoading(false);
  }

  async function approveLoan(id) {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    try {
      const tx = await contract.approveLoan(id);
      setStatus(`Approving loan #${id}...`);
      await tx.wait();
      setStatus(`✓ Loan #${id} approved! Check "My Approved" tab to fund it.`);
      fetchLoans();
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  }

  async function rejectLoan(id) {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    try {
      const tx = await contract.rejectLoan(id);
      setStatus(`Rejecting loan #${id}...`);
      await tx.wait();
      setStatus(`✓ Loan #${id} rejected.`);
      fetchLoans();
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  }

  async function fundLoan(id, amount) {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    try {
      const tx = await contract.fundLoan(id, { value: amount });
      setStatus(`Funding loan #${id}...`);
      await tx.wait();
      setStatus(`✓ Loan #${id} funded successfully!`);
      fetchLoans();
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  const LoanCard = ({ loan, showApproveReject, showFund, showStatus }) => (
    <div className="border rounded-lg p-3 mb-3 bg-white shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-lg text-gray-700">Loan #{loan.id}</div>
        <div className="text-xs text-gray-500 border rounded px-2 py-1">
          ID: {loan.id}
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
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="bg-green-50 p-2 rounded">
          <div className="text-gray-600 text-xs">Amount</div>
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
          <div className="text-gray-600 text-xs">Deadline</div>
          <div className="font-semibold text-blue-700 text-xs">
            {new Date(Number(loan.repaymentDeadline) * 1000).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {showStatus && (
        <div className="border-t pt-3 mb-3">
          <div className="text-sm flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <span className={`font-bold px-3 py-1 rounded ${loan.repaid ? 'bg-green-100 text-green-700' : loan.status === 3 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-600'}`}>
              {loan.repaid ? '✓ Repaid' : loan.status === 3 ? '⏳ Funded' : 'Processing'}
            </span>
          </div>
        </div>
      )}
      
      {showApproveReject && (
        <div className="flex gap-2 mt-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
            onClick={() => approveLoan(loan.id)}
            disabled={loading}
          >
            ✓ Approve
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
            onClick={() => rejectLoan(loan.id)}
            disabled={loading}
          >
            ✗ Reject
          </button>
        </div>
      )}
      
      {showFund && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 w-full disabled:opacity-50 font-semibold"
          onClick={() => fundLoan(loan.id, loan.amount)}
          disabled={loading}
        >
          💰 Fund {ethers.utils.formatEther(loan.amount)} ETH
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-green-700 mb-2">🌾 Lender Portal</h2>
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="border rounded px-3 py-1 bg-gray-50">
                <span className="font-semibold">Wallet:</span> {myAddress ? `${myAddress.slice(0, 8)}...${myAddress.slice(-6)}` : 'Not connected'}
              </div>
              <div className="border rounded px-3 py-1 bg-gray-50">
                <span className="font-semibold">Network:</span> {network || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6 gap-2">
          <button
            className={`px-6 py-3 font-semibold rounded-t transition ${activeTab === 'pending' ? 'border-b-2 border-green-600 text-green-700 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('pending')}
          >
            📋 Pending ({pendingLoans.length})
          </button>
          <button
            className={`px-6 py-3 font-semibold rounded-t transition ${activeTab === 'approved' ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('approved')}
          >
            ✅ My Approved ({approvedLoans.length})
          </button>
          <button
            className={`px-6 py-3 font-semibold rounded-t transition ${activeTab === 'funded' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-100' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('funded')}
          >
            💰 My Funded ({myFundedLoans.length})
          </button>
        </div>
        
        {loading && <div className="mb-4 text-center text-blue-600 font-semibold py-8">⏳ Loading loans...</div>}
        
        {/* Pending Loans Tab */}
        {activeTab === 'pending' && !loading && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <p className="text-sm text-green-800">
                <span className="font-semibold">📌 Instructions:</span> Review loan requests and click "Approve" to commit to funding, or "Reject" to decline.
              </p>
            </div>
            {pendingLoans.length === 0 && <div className="text-center text-gray-500 py-12 border rounded bg-gray-50">No pending loans to review.</div>}
            {pendingLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} showApproveReject={true} />
            ))}
          </div>
        )}
        
        {/* Approved Loans Tab */}
        {activeTab === 'approved' && !loading && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">📌 Instructions:</span> You approved these loans. Click "Fund" to transfer ETH to the farmer.
              </p>
            </div>
            {approvedLoans.length === 0 && <div className="text-center text-gray-500 py-12 border rounded bg-gray-50">No approved loans. Go to "Pending Loans" to approve some!</div>}
            {approvedLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} showFund={true} />
            ))}
          </div>
        )}
        
        {/* Funded Loans Tab */}
        {activeTab === 'funded' && !loading && (
          <div>
            <div className="bg-purple-100 border border-purple-200 rounded p-3 mb-4">
              <p className="text-sm text-purple-800">
                <span className="font-semibold">📌 Insights:</span> Track your funded loans and monitor repayment status.
              </p>
            </div>
            {myFundedLoans.length === 0 && <div className="text-center text-gray-500 py-12 border rounded bg-gray-50">No funded loans yet. Approve and fund loans to see them here!</div>}
            {myFundedLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} showStatus={true} />
            ))}
          </div>
        )}
        
        {status && (
          <div className={`mt-6 p-4 rounded-lg font-semibold ${status.includes('✓') ? 'bg-green-100 text-green-800 border border-green-200' : status.includes('Error') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
            {status}
          </div>
        )}
        
        <button
          className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg w-full font-semibold transition"
          onClick={fetchLoans}
          disabled={loading}
        >
          🔄 Refresh All Loans
        </button>
      </div>
    </div>
  );
}
