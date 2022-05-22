//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Reviews.sol";

import "hardhat/console.sol";

contract Verifier is ERC1155, Ownable, AccessControl {
    using Counters for Counters.Counter;
    using Reviews for Reviews.Review;

    // state vars
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public constant VERIFIER = 0;
    uint256 public FLOOR_PRICE = 100000000000000; // 0.0001 eth

    uint256 public s_orgId;
    string public s_name;
    mapping(uint256 => Reviews.Review) public s_verifiers; // orgId -> # of tokens
    address public s_appraiserContract;

    // events

    // errors
    error Verifier__OnlyAdminCanMintNFT();
    error Verifier__OnlyAdminCanTransferVerifierNFT();
    error Verifier__InvalidBurnerAddress();
    error Verifier__InvalidMsgValue();
    error ERC1155__NotOwnerNorApproved();

    // modifiers
    constructor(
        uint256 orgId_,
        string memory name_,
        address addr_,
        string memory URI_,
        address owner_
    ) ERC1155(URI_) {
        transferOwnership(owner_);

        s_orgId = orgId_;
        s_name = name_;

        _mint(addr_, VERIFIER, 10**3, "");
        _setupRole(ADMIN_ROLE, addr_);
        s_appraiserContract = _msgSender();
    }

    function _isAdminOrOwner() private returns (bool) {
        if (
            hasRole(ADMIN_ROLE, _msgSender()) == false &&
            _msgSender() != owner()
        ) {
            return false;
        }
        return true;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        if (
            (from == _msgSender() || isApprovedForAll(from, _msgSender())) ==
            false
        ) {
            revert ERC1155__NotOwnerNorApproved();
        }
        if (!_isAdminOrOwner()) {
            revert Verifier__OnlyAdminCanTransferVerifierNFT();
        }
        _safeTransferFrom(from, to, id, amount, data);
    }

    function adminMintBatch(
        uint256[] memory ids_,
        uint256[] memory amounts_,
        address to_
    ) external onlyOwner {
        _mintBatch(to_, ids_, amounts_, "");
    }

    // check admin role for sender
    function mintBatch(address to_) external payable {
        if (!_isAdminOrOwner()) {
            revert Verifier__OnlyAdminCanMintNFT();
        }
        uint256 _msgVal = msg.value;
        if (_msgVal < FLOOR_PRICE) {
            revert Verifier__InvalidMsgValue();
        }
        uint256 amount_ = _msgVal / FLOOR_PRICE;
        payable(owner()).transfer(_msgVal);
        uint256[] memory amounts_ = new uint[](1);
        uint256[] memory ids_ = new uint[](1);

        ids_[0] = VERIFIER;
        amounts_[0] = amount_;

        _mintBatch(to_, ids_, amounts_, "");
    }

    function setAppraiserContractAddress(address appraiserContractAddress_)
        external
        onlyOwner
    {
        s_appraiserContract = appraiserContractAddress_;
    }

    function burnVerifierForAddress(address burnTokenAddress) external {
        if (_msgSender() != s_appraiserContract) {
            revert Verifier__InvalidBurnerAddress();
        }
        _burn(burnTokenAddress, VERIFIER, 1);
    }

    function isAdmin(address addr) external view returns (bool) {
        return hasRole(keccak256("ADMIN_ROLE"), addr);
    }

    // MUST be implemented to override from ERC1155 / AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
