import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Lender() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState("");

  async function fetchLoans() {
    // Replace with deployed contract address and ABI
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", LOAN_ABI, provider);
    // Demo: fetch first 10 loans
    let arr = [];
    for (let i = 0; i < 10; i++) {
      try {
        const loan = await contract.getLoan(i);
        if (!loan.funded) arr.push({ ...loan, id: i });
      } catch {}
    }
    setLoans(arr);
  }

  async function fundLoan(id, amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract("LOAN_CONTRACT_ADDRESS", LOAN_ABI, signer);
    try {
      const tx = await contract.fundLoan(id, { value: amount });
      await tx.wait();
      setStatus("Loan funded!");
      fetchLoans();
    } catch (e) {
      setStatus(e.message);
    }
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Open Crop Loans</h2>
        {loans.length === 0 && <div>No open loans.</div>}
        {loans.map(loan => (
          <div key={loan.id} className="border p-2 mb-2 rounded">
            <div>Farmer: {loan.farmer}</div>
            <div>Amount: {ethers.utils.formatEther(loan.amount)} ETH</div>
            <div>Crop: {loan.cropType}</div>
            <div>Deadline: {new Date(Number(loan.repaymentDeadline) * 1000).toLocaleString()}</div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => fundLoan(loan.id, loan.amount)}
            >
              Fund Loan
            </button>
          </div>
        ))}
        {status && <div className="mt-4 text-green-600">{status}</div>}
      </div>
    </div>
  );
}
