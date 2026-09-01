// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Errors.sol";
import "./interfaces/IRiskEngine.sol";

contract MockOracle {
    struct SensorReading {
        uint256 locationId;
        int64 rainfall;     // mm x 100
        int64 riverLevel;   // cm
        int64 soilMoisture; // % x 100
        uint256 timestamp;  // Unix timestamp
    }

    address public owner;
    IRiskEngine public riskEngine;

    mapping(uint256 => SensorReading) private _latestReadings;

    event ReadingPushed(
        uint256 indexed locationId,
        int64 rainfall,
        int64 riverLevel,
        int64 soilMoisture,
        uint256 timestamp
    );

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotAuthorized(msg.sender);
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setRiskEngine(address _riskEngine) external onlyOwner {
        riskEngine = IRiskEngine(_riskEngine);
    }

    function pushReading(
        uint256 locationId,
        int64 rainfall,
        int64 riverLevel,
        int64 soilMoisture
    ) external onlyOwner {
        SensorReading memory reading = SensorReading({
            locationId: locationId,
            rainfall: rainfall,
            riverLevel: riverLevel,
            soilMoisture: soilMoisture,
            timestamp: block.timestamp
        });

        _latestReadings[locationId] = reading;

        emit ReadingPushed(locationId, rainfall, riverLevel, soilMoisture, block.timestamp);

        // Update risk score in risk engine if configured
        if (address(riskEngine) != address(0)) {
            int64[] memory signals = new int64[](3);
            signals[0] = rainfall;
            signals[1] = riverLevel;
            signals[2] = soilMoisture;

            uint8[] memory weights = new uint8[](3);
            weights[0] = 40;
            weights[1] = 35;
            weights[2] = 25;

            uint32 calculatedScore = riskEngine.calculateRiskScore(signals, weights);
            riskEngine.updateLocationRisk(locationId, calculatedScore);
        }
    }

    function latestReading(uint256 locationId) external view returns (SensorReading memory) {
        return _latestReadings[locationId];
    }
}
