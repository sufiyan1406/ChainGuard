// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Errors.sol";
import "./PolicyNFT.sol";
import "./interfaces/IRiskEngine.sol";

contract InsurancePool {
    struct Policy {
        uint256 policyId;
        address holder;
        uint256 locationId;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 startTimestamp;
        bool claimed;
    }

    address public owner;
    PolicyNFT public policyNFT;
    IRiskEngine public riskEngine;

    mapping(uint256 => Policy) private _policies;
    mapping(address => uint256[]) private _ownerPolicies;

    event PolicyPurchased(
        uint256 indexed policyId,
        address indexed holder,
        uint256 locationId,
        uint256 coverage
    );

    event PayoutTriggered(
        uint256 indexed policyId,
        address indexed holder,
        uint256 amount,
        uint32 riskScore
    );

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotAuthorized(msg.sender);
        }
        _;
    }

    constructor(address _policyNFT, address _riskEngine) {
        owner = msg.sender;
        policyNFT = PolicyNFT(_policyNFT);
        riskEngine = IRiskEngine(_riskEngine);
    }

    receive() external payable {}

    function setRiskEngine(address _riskEngine) external onlyOwner {
        riskEngine = IRiskEngine(_riskEngine);
    }

    function buyPolicy(
        uint256 locationId,
        uint256 coverageAmount
    ) external payable returns (uint256 policyId) {
        uint256 requiredPremium = riskEngine.pricePremium(locationId);
        if (msg.value < requiredPremium) {
            revert InsufficientPremium(requiredPremium, msg.value);
        }

        policyId = policyNFT.mint(msg.sender);

        Policy memory newPolicy = Policy({
            policyId: policyId,
            holder: msg.sender,
            locationId: locationId,
            coverageAmount: coverageAmount,
            premiumPaid: msg.value,
            startTimestamp: block.timestamp,
            claimed: false
        });

        _policies[policyId] = newPolicy;
        _ownerPolicies[msg.sender].push(policyId);

        emit PolicyPurchased(policyId, msg.sender, locationId, coverageAmount);
    }

    function checkAndPayout(uint256 policyId) external {
        Policy storage policy = _policies[policyId];
        if (policy.holder == address(0)) {
            revert PolicyNotFound(policyId);
        }

        if (policy.claimed) {
            revert AlreadyClaimed(policyId);
        }

        bool trigger = riskEngine.shouldTriggerPayout(policyId);
        if (!trigger) {
            return;
        }

        address currentHolder = policyNFT.ownerOf(policyId);
        policy.claimed = true;

        uint256 payoutAmount = policy.coverageAmount;
        if (address(this).balance < payoutAmount) {
            payoutAmount = address(this).balance;
        }

        emit PayoutTriggered(policyId, currentHolder, payoutAmount, 8500);

        (bool success, ) = payable(currentHolder).call{value: payoutAmount}("");
        require(success, "Payout transfer failed");
    }

    function getPoliciesByOwner(address holder) external view returns (uint256[] memory) {
        return _ownerPolicies[holder];
    }

    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        Policy memory p = _policies[policyId];
        if (p.holder == address(0)) {
            revert PolicyNotFound(policyId);
        }
        return p;
    }
}
