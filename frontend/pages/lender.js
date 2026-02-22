import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';

export default function Lender() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");

  async function fetchLoans() {
    setLoading(true);
    // Replace with deployed contract address and ABI
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const net = await provider.getNetwork();
    setNetwork(net.name);
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", loanArtifact.abi, signer);
    let arr = [];
    for (let i = 0; i < 10; i++) {
      try {
        const loan = await contract.getLoan(i);
        if (!loan.funded) arr.push({ ...loan, id: i });
      } catch {}
    }
    setLoans(arr);
    setLoading(false);
  }

  async function fundLoan(id, amount) {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", loanArtifact.abi, signer);
    try {
      const tx = await contract.fundLoan(id, { value: amount });
      setStatus("Transaction pending...");
      await tx.wait();
      setStatus("Loan funded!");
      fetchLoans();
    } catch (e) {
      setStatus(e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Open Crop Loans</h2>
        {loading && <div className="mb-4 text-green-600">Loading...</div>}
        {loans.length === 0 && !loading && <div>No open loans.</div>}
        {loans.map(loan => (
          <div key={loan.id} className="border p-2 mb-2 rounded bg-green-100">
            <div className="font-semibold">Farmer: {loan.farmer}</div>
            <div>Amount: {ethers.utils.formatEther(loan.amount)} ETH</div>
            <div>Crop: {loan.cropType}</div>
            <div>Deadline: {new Date(Number(loan.repaymentDeadline) * 1000).toLocaleString()}</div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded mt-2 w-full"
              onClick={() => fundLoan(loan.id, loan.amount)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Fund Loan'}
            </button>
          </div>
        ))}
        {status && <div className="mt-4 text-green-600">{status}</div>}
        <div className="mt-4 text-xs text-gray-500">Network: {network}</div>
      </div>
    </div>
  );
}
