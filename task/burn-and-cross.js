const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("burn-and-cross")
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
      const nftPoolLockAndReleaseDeployment = await hre.companionNetworks[
        "destChain"
      ].deployments.get("NFTPoolLockAndRelease");
      receiver = nftPoolLockAndReleaseDeployment.address;
      console.log("receiver is not set in command");
    }
    console.log(`receiver's address is ${receiver}`);

    // tranfer link token to address of the pool
    const linkTokenAddress = networkConfig[network.config.chainId].linkToken;
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
    const nftPoolBurnAndMint = await ethers.getContract(
      "NFTPoolBurnAndMint",
      firstAccount
    );
    const linkBalance = await linkToken.balanceOf(firstAccount);
    console.log("Your LINK Balance:", linkBalance);
    const transferTx = await linkToken.transfer(
      nftPoolBurnAndMint.target,
      ethers.parseEther("10")
    );
    await transferTx.wait(6);
    const balance = await linkToken.balanceOf(nftPoolBurnAndMint.target);
    console.log(`the balance of pool is ${balance}`);

    // approve pool address to call tranferFrom
    const wnft = await ethers.getContract("WrappedMyToken", firstAccount);
    await wnft.approve(nftPoolBurnAndMint.target, tokenId);
    console.log("approve success");

    // call lock and send
    const burnAndSendNFTTx = await nftPoolBurnAndMint.burnAndSendNFT(
      tokenId,
      firstAccount,
      chainSelector,
      receiver
    );

    console.log(`ccip transaction is sent, tx hash is ${burnAndSendNFTTx}`);
  });

module.exports = {};
