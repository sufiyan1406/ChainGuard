#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{
    alloy_primitives::U256,
    prelude::*,
};

sol_storage! {
    #[entrypoint]
    pub struct RiskEngine {
        // Storage mapping locationId => last computed risk score (basis points: 0-10000) stored as uint256
        mapping(uint256 => uint256) location_risk_scores;
    }
}

#[public]
impl RiskEngine {
    /// Calculate risk score (0 - 10000) given array of int64 signals and uint8 weights.
    /// Expected signals order: [rainfall, riverLevel, soilMoisture]
    pub fn calculate_risk_score(
        &self,
        signals: Vec<i64>,
        weights: Vec<u8>,
    ) -> Result<u32, Vec<u8>> {
        if signals.len() < 3 || weights.len() < 3 {
            return Ok(1000); // 10.00% base
        }

        // Signal 0: Rainfall (mm x 100). Baseline 2,000 (20mm). Trigger max at 25,000 (250mm).
        let rainfall = signals[0].max(0) as u64;
        let rain_score = if rainfall <= 2000 {
            0u64
        } else if rainfall >= 25000 {
            10000u64
        } else {
            ((rainfall - 2000) * 10000) / (25000 - 2000)
        };

        // Signal 1: River Level (cm). Baseline 150cm. Trigger max at 600cm.
        let river = signals[1].max(0) as u64;
        let river_score = if river <= 150 {
            0u64
        } else if river >= 600 {
            10000u64
        } else {
            ((river - 150) * 10000) / (600 - 150)
        };

        // Signal 2: Soil Moisture (% x 100). Baseline 4500 (45%). Trigger max at 9000 (90%).
        let moisture = signals[2].max(0) as u64;
        let moisture_score = if moisture <= 4500 {
            0u64
        } else if moisture >= 9000 {
            10000u64
        } else {
            ((moisture - 4500) * 10000) / (9000 - 4500)
        };

        let w0 = weights[0] as u64;
        let w1 = weights[1] as u64;
        let w2 = weights[2] as u64;
        let total_weight = (w0 + w1 + w2).max(1);

        let weighted_score = (rain_score * w0 + river_score * w1 + moisture_score * w2) / total_weight;
        let final_score = (weighted_score as u32).min(10000);

        Ok(final_score)
    }

    /// Price premium for a location based on base cost (0.01 ETH) + risk scaling factor
    pub fn price_premium(&self, location_id: U256) -> Result<U256, Vec<u8>> {
        let stored_risk = self.location_risk_scores.get(location_id).to::<u64>();
        let base_premium = 10_000_000_000_000_000u128; // 0.01 ETH in wei

        let risk_addon = (base_premium * stored_risk as u128) / 10000;
        let final_premium = base_premium + risk_addon;

        Ok(U256::from(final_premium))
    }

    /// Evaluates whether a policy trigger condition is met (score >= 7500 basis points / 75%)
    pub fn should_trigger_payout(&self, policy_id: U256) -> Result<bool, Vec<u8>> {
        let score = self.location_risk_scores.get(policy_id).to::<u64>();
        Ok(score >= 7500)
    }

    /// Helper for tests/oracles to update location risk score state directly
    pub fn update_location_risk(&mut self, location_id: U256, score: u32) -> Result<(), Vec<u8>> {
        let bounded_score = score.min(10000);
        let mut setter = self.location_risk_scores.setter(location_id);
        setter.set(U256::from(bounded_score));
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_signals_produce_low_risk() {
        let engine = RiskEngine::default();
        let signals = vec![2000, 150, 4500]; // Normal readings
        let weights = vec![40, 35, 25];
        let score = engine.calculate_risk_score(signals, weights).unwrap();
        assert_eq!(score, 0);
    }

    #[test]
    fn test_flood_signals_produce_max_risk() {
        let engine = RiskEngine::default();
        let signals = vec![25000, 600, 9000]; // Flood readings
        let weights = vec![40, 35, 25];
        let score = engine.calculate_risk_score(signals, weights).unwrap();
        assert_eq!(score, 10000);
    }

    #[test]
    fn test_warning_signals_produce_intermediate_risk() {
        let engine = RiskEngine::default();
        let signals = vec![13500, 375, 6750]; // Midpoint readings
        let weights = vec![40, 35, 25];
        let score = engine.calculate_risk_score(signals, weights).unwrap();
        assert!(score > 4000 && score < 6000);
    }
}
