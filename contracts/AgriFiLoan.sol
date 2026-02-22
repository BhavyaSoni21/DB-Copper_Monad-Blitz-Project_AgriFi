// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./AgriFiCreditNFT.sol";

contract AgriFiLoan is ReentrancyGuard, Pausable, Ownable {

    AggregatorV3Interface public priceFeed;
    AgriFiCreditNFT public creditNFT;

    uint256 public fallbackCropPrice;
    bool public useFallback;

    uint256 public constant MAX_LOANS_PER_ADDRESS = 3;

    mapping(address => uint256) public activeLoans;
    mapping(address => uint256) public defaults;
    mapping(uint256 => bool) public isDefaulted;

    enum LoanStatus { Pending, Approved, Rejected, Funded, Repaid }

    struct Loan {
        address farmer;
        address lender;
        uint256 amount;
        string cropType;
        uint256 repaymentDeadline;
        uint256 durationInDays;
        bool funded;
        bool repaid;
        LoanStatus status;
    }

    Loan[] private loans;

    constructor(
        address _creditNFT,
        address _priceFeed,
        address initialOwner
    )
        Ownable(initialOwner)
    {
        require(_creditNFT != address(0), "Invalid NFT address");
        require(_priceFeed != address(0), "Invalid price feed address");

        creditNFT = AgriFiCreditNFT(_creditNFT);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    // ---------------- Oracle ----------------

    function getCropPrice() public view returns (uint256) {
        if (useFallback && fallbackCropPrice > 0) {
            return fallbackCropPrice;
        }

        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();

        require(price > 0, "Invalid oracle price");
        require(updatedAt > 0, "Stale oracle");

        return uint256(price);
    }

    function getInterestRate(address farmer) public view returns (uint256) {
        uint256 score = creditNFT.creditScore(farmer);
        uint256 def = defaults[farmer];
        uint256 cropPrice = getCropPrice();

        uint256 baseRate = 500; // 5%

        if (def > 0) baseRate = 1000;
        if (score > 5) baseRate = 200;
        if (cropPrice < 1000) baseRate += 200;

        return baseRate;
    }

    function setFallbackCropPrice(uint256 price) external onlyOwner {
        fallbackCropPrice = price;
        useFallback = true;
    }

    function disableFallback() external onlyOwner {
        useFallback = false;
    }

    // ---------------- Loan Core ----------------

    event LoanRequested(
        uint256 indexed loanId,
        address indexed farmer,
        uint256 amount,
        string cropType,
        uint256 repaymentDeadline
    );

    event LoanApproved(uint256 indexed loanId, address indexed lender);
    event LoanRejected(uint256 indexed loanId, address indexed lender);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, address indexed farmer);

    function requestLoan(
        uint256 amount,
        string memory cropType,
        uint256 durationInDays
    ) external whenNotPaused {

        require(amount > 0, "Invalid amount");
        require(durationInDays > 0, "Invalid duration");
        require(activeLoans[msg.sender] < MAX_LOANS_PER_ADDRESS, "Loan limit reached");
        require(defaults[msg.sender] == 0, "Previously defaulted");

        uint256 deadline = block.timestamp + durationInDays * 1 days;

        loans.push(
            Loan({
                farmer: msg.sender,
                lender: address(0),
                amount: amount,
                cropType: cropType,
                repaymentDeadline: deadline,
                durationInDays: durationInDays,
                funded: false,
                repaid: false,
                status: LoanStatus.Pending
            })
        );

        activeLoans[msg.sender]++;

        emit LoanRequested(loans.length - 1, msg.sender, amount, cropType, deadline);
    }

    function approveLoan(uint256 loanId) external whenNotPaused {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.status == LoanStatus.Pending, "Loan not pending");
        require(!loan.funded, "Already funded");

        loan.status = LoanStatus.Approved;
        loan.lender = msg.sender;

        emit LoanApproved(loanId, msg.sender);
    }

    function rejectLoan(uint256 loanId) external whenNotPaused {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.status == LoanStatus.Pending, "Loan not pending");
        require(!loan.funded, "Already funded");

        loan.status = LoanStatus.Rejected;
        activeLoans[loan.farmer]--;

        emit LoanRejected(loanId, msg.sender);
    }

    function fundLoan(uint256 loanId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.status == LoanStatus.Approved, "Loan not approved");
        require(!loan.funded, "Already funded");
        require(msg.value == loan.amount, "Incorrect amount");
        require(msg.sender == loan.lender, "Only approving lender can fund");

        loan.funded = true;
        loan.status = LoanStatus.Funded;

        payable(loan.farmer).transfer(msg.value);

        emit LoanFunded(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.funded, "Not funded");
        require(!loan.repaid, "Already repaid");
        require(msg.sender == loan.farmer, "Only farmer");
        require(block.timestamp <= loan.repaymentDeadline, "Past deadline");
        require(msg.value == loan.amount, "Incorrect repayment");

        loan.repaid = true;
        loan.status = LoanStatus.Repaid;
        activeLoans[loan.farmer]--;

        payable(loan.lender).transfer(msg.value);

        creditNFT.mintCreditNFT(
            loan.farmer,
            loan.cropType,
            loan.durationInDays
        );

        emit LoanRepaid(loanId, loan.farmer);
    }

    function markDefault(uint256 loanId) external onlyOwner {
        require(loanId < loans.length, "Invalid loan ID");

        Loan storage loan = loans[loanId];

        require(loan.funded && !loan.repaid, "Invalid state");

        isDefaulted[loanId] = true;
        defaults[loan.farmer]++;
        activeLoans[loan.farmer]--;
    }

    // ---------------- Admin ----------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ---------------- Views ----------------

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        require(loanId < loans.length, "Invalid loan ID");
        return loans[loanId];
    }

    function getLoans(uint256 offset, uint256 limit)
        external
        view
        returns (Loan[] memory)
    {
        require(offset < loans.length, "Offset invalid");

        uint256 end = offset + limit;
        if (end > loans.length) end = loans.length;

        Loan[] memory page = new Loan[](end - offset);

        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = loans[i];
        }

        return page;
    }
}