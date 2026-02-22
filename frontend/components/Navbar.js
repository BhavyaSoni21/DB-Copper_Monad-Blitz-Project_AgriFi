import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-link">Request Loan (Farmer)</Link>
      <Link href="/farmer-dashboard" className="navbar-link">Farmer Dashboard</Link>
      <Link href="/lender" className="navbar-link green">Lender Portal</Link>
      <Link href="/lender-dashboard" className="navbar-link green">Legacy Lender Dashboard</Link>
    </nav>
  );
}
