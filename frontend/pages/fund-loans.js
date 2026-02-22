import { useEffect, useState } from "react";
import { ethers } from "ethers";
import loanArtifact from '../../artifacts/contracts/AgriFiLoan.sol/AgriFiLoan.json';
import contracts from '../config/contracts';

export default function FundLoans() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");
  const [myAddress, setMyAddress] = useState("");

  async function fetchApprovedLoans() {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setMyAddress(address);
    const net = await provider.getNetwork();
    setNetwork(net.name);
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    let arr = [];
    for (let i = 0; i < 20; i++) {
      try {
        const loan = await contract.getLoan(i);
        // Show only approved loans (status 1 = Approved) that this lender approved
        if (loan.status === 1 && loan.lender.toLowerCase() === address.toLowerCase()) {
          arr.push({ ...loan, id: i });
        }
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
    const contract = new ethers.Contract(contracts.loanContract, loanArtifact.abi, signer);
    try {
      const tx = await contract.fundLoan(id, { value: amount });
      setStatus("Funding loan...");
      await tx.wait();
      setStatus("Loan funded successfully!");
      fetchApprovedLoans();
    } catch (e) {
      setStatus(e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Approved Loans to Fund</h2>
        <div className="text-sm text-gray-600 mb-4">
          Your address: {myAddress ? `${myAddress.slice(0, 6)}...${myAddress.slice(-4)}` : 'Not connected'}
        </div>
        {loading && <div className="mb-4 text-green-600">Loading...</div>}
        {loans.length === 0 && !loading && <div>No approved loans to fund.</div>}
        {loans.map(loan => (
          <div key={loan.id} className="border p-2 mb-2 rounded bg-green-100">
            <div className="font-semibold">Loan ID: {loan.id}</div>
            <div className="font-semibold">Farmer: {loan.farmer}</div>
            <div>Amount: {ethers.utils.formatEther(loan.amount)} ETH</div>
            <div>Crop: {loan.cropType}</div>
            <div>Duration: {loan.durationInDays.toString()} days</div>
            <div>Deadline: {new Date(Number(loan.repaymentDeadline) * 1000).toLocaleString()}</div>
            <div className="mt-2 text-sm text-green-600">✓ You approved this loan</div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded mt-2 w-full"
              onClick={() => fundLoan(loan.id, loan.amount)}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Fund ${ethers.utils.formatEther(loan.amount)} ETH`}
            </button>
          </div>
        ))}
        {status && <div className="mt-4 text-green-600">{status}</div>}
        <div className="mt-4 text-xs text-gray-500">Network: {network}</div>
      </div>
    </div>
  );
}
