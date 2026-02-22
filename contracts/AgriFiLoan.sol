// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./AgriFiCreditNFT.sol";

/// @title AgriFiLoan
/// @notice Static analysis recommended: Slither/Mythril
contract AgriFiLoan is ReentrancyGuard, Pausable {
    // Chainlink oracle for crop price
    AggregatorV3Interface public priceFeed;
    uint256 public fallbackCropPrice;
    bool public useFallback;
    // Loan request limit per address
    uint256 public constant MAX_LOANS_PER_ADDRESS = 3;
    mapping(address => uint256) public activeLoans;

    // Default tracking
    mapping(address => uint256) public defaults;
    mapping(uint256 => bool) public isDefaulted;

    // Get latest crop price from oracle or fallback
    function getCropPrice() public view returns (uint256) {
        if (useFallback && fallbackCropPrice > 0) {
            return fallbackCropPrice;
        }
        (
            ,
            int256 price,
            ,
            uint256 updatedAt,
            
        ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid oracle price");
        require(updatedAt > 0, "Stale oracle price");
        return uint256(price);
    }

    // Risk-based pricing using crop price
    function getInterestRate(address farmer) public view returns (uint256) {
        uint256 score = creditNFT.creditScore(farmer);
        uint256 def = defaults[farmer];
        uint256 cropPrice = getCropPrice();
        uint256 baseRate = 500; // 5% base
        if (def > 0) baseRate = 1000; // 10% for defaulters
        if (score > 5) baseRate = 200; // 2% for high score
        // If crop price is low, increase risk
        if (cropPrice < 1000) baseRate += 200;
        return baseRate;
    }
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
    Loan[] private loans;

    // Constructor with oracle address
    constructor(address _creditNFT, address _priceFeed) {
        require(_creditNFT != address(0), "Invalid NFT address");
        require(_priceFeed != address(0), "Invalid price feed address");
        creditNFT = AgriFiCreditNFT(_creditNFT);
        priceFeed = AggregatorV3Interface(_priceFeed);
        fallbackCropPrice = 0;
        useFallback = false;
    }

    // Admin can set fallback price if oracle fails
    function setFallbackCropPrice(uint256 price) external onlyOwner {
        fallbackCropPrice = price;
        useFallback = true;
    }

    function disableFallback() external onlyOwner {
        useFallback = false;
    }

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
        require(activeLoans[msg.sender] < MAX_LOANS_PER_ADDRESS, "Loan limit reached");
        require(defaults[msg.sender] == 0, "Address has defaulted before");

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
        activeLoans[msg.sender]++;

        emit LoanRequested(
            loans.length - 1,
            msg.sender,
            amount,
            cropType,
            deadline
        );
    }

    function fundLoan(uint256 loanId) external payable nonReentrant whenNotPaused {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(!loan.funded, "Already funded");
        require(msg.value == loan.amount, "Incorrect amount");
        require(msg.sender != loan.farmer, "Borrower cannot fund own loan");
        require(tx.origin == msg.sender, "No flash loans");

        loan.lender = msg.sender;
        loan.funded = true;

        payable(loan.farmer).transfer(msg.value);

        emit LoanFunded(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId) external payable nonReentrant whenNotPaused {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.funded, "Loan not funded");
        require(!loan.repaid, "Already repaid");
        require(msg.sender == loan.farmer, "Only farmer can repay");
        require(block.timestamp <= loan.repaymentDeadline, "Past deadline");
        require(msg.value == loan.amount, "Incorrect repayment amount");

        loan.repaid = true;
        activeLoans[loan.farmer]--;

        payable(loan.lender).transfer(msg.value);

        // Mint NFT with original duration
        creditNFT.mintCreditNFT(
            loan.farmer,
            loan.cropType,
            loan.durationInDays
        );

        emit LoanRepaid(loanId, loan.farmer);
    }

    // Mark loan as defaulted and penalize
    function markDefault(uint256 loanId) external onlyOwner {
        require(loanId < loans.length, "Invalid loan ID");
        Loan storage loan = loans[loanId];
        require(loan.funded && !loan.repaid, "Loan must be funded and not repaid");
        isDefaulted[loanId] = true;
        defaults[loan.farmer]++;
        activeLoans[loan.farmer]--;
    }

    // Emergency stop mechanism
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        require(loanId < loans.length, "Invalid loan ID");
        return loans[loanId];
    }

    // Pagination for loan history
    function getLoans(uint256 offset, uint256 limit) external view returns (Loan[] memory) {
        require(offset < loans.length, "Offset out of bounds");
        uint256 end = offset + limit;
        if (end > loans.length) {
            end = loans.length;
        }
        Loan[] memory page = new Loan[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = loans[i];
        }
        return page;
    }
}