// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/MockOracle.sol";
import "../src/InsurancePool.sol";

contract TriggerScenarioScript {
    enum Scenario { NORMAL, WARNING, FLOOD }

    function pushScenario(address oracleAddress, uint256 locationId, Scenario scenario) external {
        MockOracle oracle = MockOracle(oracleAddress);

        if (scenario == Scenario.NORMAL) {
            // Rainfall: 20mm (2000), River: 150cm, Moisture: 45% (4500)
            oracle.pushReading(locationId, 2000, 150, 4500);
        } else if (scenario == Scenario.WARNING) {
            // Rainfall: 120mm (12000), River: 350cm, Moisture: 65% (6500)
            oracle.pushReading(locationId, 12000, 350, 6500);
        } else if (scenario == Scenario.FLOOD) {
            // Rainfall: 250mm (25000), River: 600cm, Moisture: 90% (9000)
            oracle.pushReading(locationId, 25000, 600, 9000);
        }
    }
}
