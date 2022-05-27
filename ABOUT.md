## Inspiration

\> be me
\> be hungry for dinner
\> be too lazy to cook
\> need to find a restaurant
\> found one
\> 4.5 stars on X!
\> be excited to try it out
\> terrible food
\> how did they get these great reviews?
\> disappointment, immeasurable
\> day, ruined
\> ...I bet they bought fake reviews
\> ...from X?

## What it does

Appraisr is a decentralized, verified ratings system that uses fungible tokens and NFTs to incentivize users to rate and review businesses, and vote on other reviews, in a trustless fashion.

Users can leave reviews for businesses, or vote on reviews that already exist - helping other users build their reputation as a trusted reviewer. Every time a review is created, an NFT is minted to the author, and can be collected or traded on the open market.

Businesses can also mint and transfer Verifier Tokens to verified patrons, building trust in the review process. Whenever a user is holding a Verifier Token when creating a review, the token is burned and the NFT receives a "verified" attribute. These Verifier Tokens require payment of fees for businesses to mint, providing a revenue stream for Appraisr.

However, users are unable to transfer or trade Verifier tokens, which prevents them from selling "verified" reviews, further reducing potential vectors of fraud or abuse.

Reviews are also randomly divided into 5 separate groups. With multiple randomized groups, it further inhibits gaming the system from an organization's point of view. It requires 5x the amount of "faked" reviews to maliciously influence an organization's average rating across the multiple samples.

## How we built it

Appraisr was built using Solidity and Hardhat, with embedded Chainlink VRF (Verified Random Function) and Moralis integration for web3 functionality. It utilizes a react.js front end and node.js back end.

## Challenges we ran into

Having our main contract deploy two token contracts when registering new organizations caused our contract size to exceed the mainnet limit. Even after splitting up the contract into smaller pieces, it remained too large. Eventually we decided to simply deploy onto local Hardhat testnet to instead focus on building out the dApp and smart contract logic.

Also we ran into issues debugging third party integrations and contracts, and mocking local Chainlink functionality for testing.

## Accomplishments that we're proud of

With a single person team, Appraisr is an end to end full stack dApp that solves a real world problem. It tackles a use case which is rooted in centralized trust and therefore most pertinent to blockchain's strengths.

## What we learned

Throughout this process, I learned immensely about web3 full stack best practices, including implementing off-chain oracle data via Chainlink, testing and security best practices, and front end integration via Moralis.

## What's next for Appraisr

There is still a lot of refining on the mechanics of the incentive structure so that both reviewers and organizations are properly aligned.

The UI must also be expanded, to include more user features and displays around minted NFTs and Verifier Tokens, admin-based functionality to manage organizations, as well as proper implementation of IPFS-pinned NFT metadata.

On the technical side, contract architecture still needs to be optimized to reduce contract size, split concerns, and manage access control efficiently.
