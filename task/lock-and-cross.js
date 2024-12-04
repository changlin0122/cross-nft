const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("lock-and-cross")
  .addOptionalParam("chainselector", "chain selector of the dest chain")
  .addOptionalParam("receiver", "receiver address on dest chain")
  .addParam("tokenid", "tokenid to be crossed chain")
  .setAction(async (taskArgs, hre) => {
    let chainSelector;
    let receiver;
    const tokenId = taskArgs.tokenid;
    const { firstAccount } = await getNamedAccounts();

    if (taskArgs.chainselector) {
      chainSelector = taskArgs.chainselector;
    } else {
      chainSelector =
        networkConfig[network.config.chainId].conpanionChainSelector;
      console.log("chainselector is not set in command");
    }
    console.log(`chainselector is ${chainSelector}`);
    if (taskArgs.receiver) {
      receiver = taskArgs.receiver;
    } else {
      const nftPoolBurnAndMintDeployment = await hre.companionNetworks[
        "destChain"
      ].deployments.get("NFTPoolBurnAndMint");
      receiver = nftPoolBurnAndMintDeployment.address;
      console.log("receiver is not set in command");
    }
    console.log(`receiver's address is ${receiver}`);

    // tranfer link token to address of the pool
    const linkTokenAddress = networkConfig[network.config.chainId].linkToken;
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
    const nftPoolLockAndRelease = await ethers.getContract(
      "NFTPoolLockAndRelease",
      firstAccount
    );
    const linkBalance = await linkToken.balanceOf(firstAccount);
    console.log("Your LINK Balance:", linkBalance);
    const transferTx = await linkToken.transfer(
      nftPoolLockAndRelease.target,
      ethers.parseEther("10")
    );
    await transferTx.wait(6);
    const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target);
    console.log(`the balance of pool is ${balance}`);

    // approve pool address to call tranferFrom
    const nft = await ethers.getContract("MyToken", firstAccount);
    await nft.approve(nftPoolLockAndRelease.target, tokenId);
    console.log("approve success");

    // call lock and send
    const lockAndSendNFTTx = await nftPoolLockAndRelease.lockAndSendNFT(
      tokenId,
      firstAccount,
      chainSelector,
      receiver
    );

    console.log(`ccip transaction is sent, tx hash is ${lockAndSendNFTTx}`);
  });

module.exports = {};
