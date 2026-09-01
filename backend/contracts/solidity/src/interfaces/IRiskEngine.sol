// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRiskEngine {
    function calculateRiskScore(
        int64[] calldata signals,
        uint8[] calldata weights
    ) external view returns (uint32 riskScore);

    function shouldTriggerPayout(
        uint256 policyId
    ) external view returns (bool);

    function pricePremium(
        uint256 locationId
    ) external view returns (uint256);

    function updateLocationRisk(
        uint256 locationId,
        uint32 score
    ) external;
}
