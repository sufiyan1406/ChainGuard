// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRiskEngine.sol";

interface IPolicyPool {
    struct Policy {
        uint256 policyId;
        address holder;
        uint256 locationId;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 startTimestamp;
        bool claimed;
    }
    function getPolicy(uint256 policyId) external view returns (Policy memory);
}

/// @notice Naive pure Solidity risk engine implementation for gas comparison against Rust/Stylus WASM engine.
contract SolidityRiskEngine is IRiskEngine {
    mapping(uint256 => uint32) public locationRiskScores;
    address public poolAddress;

    function setPoolAddress(address pool) external {
        poolAddress = pool;
    }

    function calculateRiskScore(
        int64[] calldata signals,
        uint8[] calldata weights
    ) external pure override returns (uint32) {
        if (signals.length < 3 || weights.length < 3) {
            return 1000;
        }

        uint64 rainfall = signals[0] > 0 ? uint64(signals[0]) : 0;
        uint64 rainScore = rainfall <= 2000 ? 0 : (rainfall >= 25000 ? 10000 : ((rainfall - 2000) * 10000) / (25000 - 2000));

        uint64 river = signals[1] > 0 ? uint64(signals[1]) : 0;
        uint64 riverScore = river <= 150 ? 0 : (river >= 600 ? 10000 : ((river - 150) * 10000) / (600 - 150));

        uint64 moisture = signals[2] > 0 ? uint64(signals[2]) : 0;
        uint64 moistureScore = moisture <= 4500 ? 0 : (moisture >= 9000 ? 10000 : ((moisture - 4500) * 10000) / (9000 - 4500));

        uint64 w0 = uint64(weights[0]);
        uint64 w1 = uint64(weights[1]);
        uint64 w2 = uint64(weights[2]);
        uint64 totalWeight = w0 + w1 + w2;
        if (totalWeight == 0) totalWeight = 1;

        uint64 weighted = (rainScore * w0 + riverScore * w1 + moistureScore * w2) / totalWeight;
        return weighted > 10000 ? 10000 : uint32(weighted);
    }

    function pricePremium(uint256 locationId) external view override returns (uint256) {
        uint256 basePremium = 0.01 ether;
        uint256 score = locationRiskScores[locationId];
        return basePremium + (basePremium * score) / 10000;
    }

    function shouldTriggerPayout(uint256 policyId) external view override returns (bool) {
        uint32 score = locationRiskScores[policyId];
        if (score == 0 && poolAddress != address(0)) {
            try IPolicyPool(poolAddress).getPolicy(policyId) returns (IPolicyPool.Policy memory p) {
                score = locationRiskScores[p.locationId];
            } catch {}
        }
        return score >= 7500;
    }

    function updateLocationRisk(uint256 locationId, uint32 score) external override {
        locationRiskScores[locationId] = score > 10000 ? 10000 : score;
    }
}
