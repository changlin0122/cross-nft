const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("NFTPoolLockandRelease deploying...");

  let sourceChainRouter;
  let linkTokenAddr;

  if (developmentChains.includes(network.name)) {
    // address _router, address _link, address nftAddr
    const ccipLocalSimulatorDeployment = await deployments.get(
      "CCIPLocalSimulator"
    );
    const ccipLocalSimulator = await ethers.getContractAt(
      "CCIPLocalSimulator",
      ccipLocalSimulatorDeployment.address
    );
    const ccipConfig = await ccipLocalSimulator.configuration();
    sourceChainRouter = ccipConfig.sourceRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    sourceChainRouter = networkConfig[network.config.chainId].router;
    linkTokenAddr = networkConfig[network.config.chainId].linkToken;
  }

  const nftDeployment = await deployments.get("MyToken");
  const nftAddr = nftDeployment.address;

  await deploy("NFTPoolLockAndRelease", {
    contract: "NFTPoolLockAndRelease",
    from: firstAccount,
    log: true,
    args: [sourceChainRouter, linkTokenAddr, nftAddr],
  });

  log("NFTPoolLockAndRelease deployed successfilly");
};

module.exports.tags = ["sourcechain", "all"];
