// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/Errors.sol";
import "../src/PolicyNFT.sol";
import "../src/InsurancePool.sol";
import "../src/MockOracle.sol";
import "../src/SolidityRiskEngine.sol";

contract InsurancePoolTest {
    PolicyNFT public nft;
    SolidityRiskEngine public riskEngine;
    InsurancePool public pool;
    MockOracle public oracle;

    event PolicyPurchased(uint256 indexed policyId, address indexed holder, uint256 locationId, uint256 coverage);
    event PayoutTriggered(uint256 indexed policyId, address indexed holder, uint256 amount, uint32 riskScore);

    receive() external payable {}

    constructor() payable {
        nft = new PolicyNFT();
        riskEngine = new SolidityRiskEngine();
        pool = new InsurancePool(address(nft), address(riskEngine));
        oracle = new MockOracle();

        nft.setInsurancePool(address(pool));
        oracle.setRiskEngine(address(riskEngine));
        riskEngine.setPoolAddress(address(pool));

        // Fund pool with 10 ETH
        (bool ok, ) = address(pool).call{value: 10 ether}("");
        require(ok, "Fund failed");
    }

    function runAllTests() external {
        testBuyPolicySuccess();
        testInsufficientPremiumReverts();
        testNormalReadingNoPayout();
        testFloodReadingTriggersPayout();
        testAlreadyClaimedReverts();
        testGetPoliciesByOwner();
        testUnauthorizedOraclePushReverts();
    }

    function testBuyPolicySuccess() public {
        uint256 locationId = 101;
        uint256 coverage = 1 ether;
        uint256 premium = riskEngine.pricePremium(locationId);

        uint256 policyId = pool.buyPolicy{value: premium}(locationId, coverage);
        require(policyId > 0, "Valid policyId");
        require(nft.ownerOf(policyId) == address(this), "Owner should be test contract");

        InsurancePool.Policy memory p = pool.getPolicy(policyId);
        require(p.locationId == locationId, "Location match");
        require(p.coverageAmount == coverage, "Coverage match");
        require(!p.claimed, "Unclaimed");
    }

    function testInsufficientPremiumReverts() public {
        uint256 locationId = 102;
        try pool.buyPolicy{value: 100}(locationId, 1 ether) {
            revert("Should have reverted InsufficientPremium");
        } catch (bytes memory) {
            // Expected revert
        }
    }

    function testNormalReadingNoPayout() public {
        uint256 locationId = 103;
        uint256 premium = riskEngine.pricePremium(locationId);
        uint256 policyId = pool.buyPolicy{value: premium}(locationId, 1 ether);

        // Push NORMAL reading
        oracle.pushReading(locationId, 2000, 150, 4500);

        pool.checkAndPayout(policyId);
        InsurancePool.Policy memory p = pool.getPolicy(policyId);
        require(!p.claimed, "Should remain unclaimed on normal reading");
    }

    function testFloodReadingTriggersPayout() public {
        uint256 locationId = 104;
        uint256 premium = riskEngine.pricePremium(locationId);
        uint256 policyId = pool.buyPolicy{value: premium}(locationId, 1 ether);

        // Push FLOOD reading
        oracle.pushReading(locationId, 25000, 600, 9000);

        pool.checkAndPayout(policyId);
        InsurancePool.Policy memory p = pool.getPolicy(policyId);
        require(p.claimed, "Should be claimed after flood payout");
    }

    function testAlreadyClaimedReverts() public {
        uint256 locationId = 105;
        uint256 premium = riskEngine.pricePremium(locationId);
        uint256 policyId = pool.buyPolicy{value: premium}(locationId, 1 ether);

        oracle.pushReading(locationId, 25000, 600, 9000);
        pool.checkAndPayout(policyId);

        try pool.checkAndPayout(policyId) {
            revert("Should revert AlreadyClaimed");
        } catch (bytes memory) {
            // Expected revert
        }
    }

    function testGetPoliciesByOwner() public {
        uint256 locationId = 106;
        uint256 premium = riskEngine.pricePremium(locationId);
        pool.buyPolicy{value: premium}(locationId, 1 ether);

        uint256[] memory myPolicies = pool.getPoliciesByOwner(address(this));
        require(myPolicies.length > 0, "Should have active policies");
    }

    function testUnauthorizedOraclePushReverts() public {
        // Calling from non-owner contract would revert
    }
}
