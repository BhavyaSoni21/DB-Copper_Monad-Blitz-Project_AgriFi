// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgriFiCreditNFT.sol";

contract AgriFiLoan {
    struct Loan {
        address farmer;
        address lender;
        uint256 amount;
        string cropType;
        uint256 repaymentDeadline;
        uint256 durationInDays;
        bool funded;
        bool repaid;
    }

    AgriFiCreditNFT public creditNFT;
    Loan[] public loans;

    event LoanRequested(
        uint256 indexed loanId,
        address indexed farmer,
        uint256 amount,
        string cropType,
        uint256 repaymentDeadline
    );

    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, address indexed farmer);

    constructor(address _creditNFT) {
        require(_creditNFT != address(0), "Invalid NFT address");
        creditNFT = AgriFiCreditNFT(_creditNFT);
    }

    function requestLoan(
        uint256 amount,
        string memory cropType,
        uint256 durationInDays
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        require(durationInDays > 0, "Invalid duration");

        uint256 deadline = block.timestamp + (durationInDays * 1 days);

        loans.push(
            Loan({
                farmer: msg.sender,
                lender: address(0),
                amount: amount,
                cropType: cropType,
                repaymentDeadline: deadline,
                durationInDays: durationInDays,
                funded: false,
                repaid: false
            })
        );

        emit LoanRequested(
            loans.length - 1,
            msg.sender,
            amount,
            cropType,
            deadline
        );
    }

    function fundLoan(uint256 loanId) external payable {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(!loan.funded, "Already funded");
        require(msg.value == loan.amount, "Incorrect amount");

        loan.lender = msg.sender;
        loan.funded = true;

        payable(loan.farmer).transfer(msg.value);

        emit LoanFunded(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId) external payable {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.funded, "Loan not funded");
        require(!loan.repaid, "Already repaid");
        require(msg.sender == loan.farmer, "Only farmer can repay");
        require(block.timestamp <= loan.repaymentDeadline, "Past deadline");
        require(msg.value == loan.amount, "Incorrect repayment amount");

        loan.repaid = true;

        payable(loan.lender).transfer(msg.value);

        // Mint NFT with original duration
        creditNFT.mintCreditNFT(
            loan.farmer,
            loan.cropType,
            loan.durationInDays
        );

        emit LoanRepaid(loanId, loan.farmer);
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        require(loanId < loans.length, "Invalid loan ID");
        return loans[loanId];
    }
}