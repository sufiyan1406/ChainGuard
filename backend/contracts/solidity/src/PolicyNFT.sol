// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Errors.sol";

contract PolicyNFT {
    string public name = "ChainGuard Parametric Policy";
    string public symbol = "CGPOLICY";

    address public insurancePool;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyPool() {
        if (msg.sender != insurancePool) {
            revert NotAuthorized(msg.sender);
        }
        _;
    }

    constructor() {
        insurancePool = msg.sender;
    }

    function setInsurancePool(address pool) external {
        if (insurancePool != msg.sender && insurancePool != address(0)) {
            revert NotAuthorized(msg.sender);
        }
        insurancePool = pool;
    }

    function mint(address to) external onlyPool returns (uint256 policyId) {
        policyId = _nextTokenId++;
        _owners[policyId] = to;
        _balances[to] += 1;

        emit Transfer(address(0), to, policyId);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) {
            revert PolicyNotFound(tokenId);
        }
        return owner;
    }

    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }
}
