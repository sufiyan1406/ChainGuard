// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Thrown when policyId does not exist in pool
error PolicyNotFound(uint256 policyId);

/// @dev Thrown when policy payout has already been claimed
error AlreadyClaimed(uint256 policyId);

/// @dev Thrown when msg.value is less than required premium
error InsufficientPremium(uint256 required, uint256 sent);

/// @dev Thrown when unauthorized account calls a restricted function
error NotAuthorized(address caller);
