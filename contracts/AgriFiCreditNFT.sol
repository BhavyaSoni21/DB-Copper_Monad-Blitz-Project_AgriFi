// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AgriFiCreditNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    mapping(address => uint256) public creditScore;
    address public loanContract;

    struct CreditMetadata {
        string cropType;
        uint256 duration;
        uint256 timestamp;
    }

    mapping(uint256 => CreditMetadata) public creditMetadata;

    modifier onlyLoanContract() {
        require(msg.sender == loanContract, "Only Loan contract can mint");
        _;
    }

    constructor(address initialOwner)
        ERC721("AgriFiCreditNFT", "AGRI")
        Ownable(initialOwner)
    {}

    function setLoanContract(address _loanContract) external onlyOwner {
        require(_loanContract != address(0), "Invalid address");
        loanContract = _loanContract;
    }

    function mintCreditNFT(
        address farmer,
        string memory cropType,
        uint256 duration
    ) external onlyLoanContract {
        require(farmer != address(0), "Invalid farmer address");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(farmer, newTokenId);

        creditMetadata[newTokenId] = CreditMetadata({
            cropType: cropType,
            duration: duration,
            timestamp: block.timestamp
        });

        creditScore[farmer] += 1;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // OZ v5 way of checking existence
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        CreditMetadata memory meta = creditMetadata[tokenId];

        return string(
            abi.encodePacked(
                "data:application/json,{",
                '"name":"AgriFi Credit NFT #',
                tokenId.toString(),
                '",',
                '"description":"Credit NFT for successful loan repayment.",',
                '"attributes":[',
                '{"trait_type":"Crop Type","value":"',
                meta.cropType,
                '"},',
                '{"trait_type":"Duration","value":"',
                meta.duration.toString(),
                '"},',
                '{"trait_type":"Timestamp","value":"',
                meta.timestamp.toString(),
                '"}',
                "]}"
            )
        );
    }
}