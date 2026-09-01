// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/PolicyNFT.sol";
import "../src/InsurancePool.sol";
import "../src/MockOracle.sol";
import "../src/SolidityRiskEngine.sol";

contract DeployScript {
    function run() external {
        address deployer = msg.sender;

        // 1. Deploy PolicyNFT
        PolicyNFT nft = new PolicyNFT();

        // 2. Deploy Risk Engine (Solidity fallback or linked Stylus contract)
        SolidityRiskEngine riskEngine = new SolidityRiskEngine();

        // 3. Deploy InsurancePool
        InsurancePool pool = new InsurancePool(address(nft), address(riskEngine));

        // 4. Deploy MockOracle
        MockOracle oracle = new MockOracle();

        // 5. Connect contracts
        nft.setInsurancePool(address(pool));
        oracle.setRiskEngine(address(riskEngine));

        // 6. Fund pool with initial test liquidity (if deployer has ETH)
        if (deployer.balance >= 0.05 ether) {
            (bool ok, ) = address(pool).call{value: 0.05 ether}("");
            require(ok, "Liquidity seed failed");
        }
    }
}
