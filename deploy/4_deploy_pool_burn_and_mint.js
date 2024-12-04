const { network, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("NFTPoolBurnAndMint deploying...");

  let destChainRouter;
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
    destChainRouter = ccipConfig.destinationRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    destChainRouter = networkConfig[network.config.chainId].router;
    linkTokenAddr = networkConfig[network.config.chainId].linkToken;
  }

  const wnftDeployment = await deployments.get("WrappedMyToken");
  const wnftAddr = wnftDeployment.address;

  await deploy("NFTPoolBurnAndMint", {
    contract: "NFTPoolBurnAndMint",
    from: firstAccount,
    log: true,
    args: [destChainRouter, linkTokenAddr, wnftAddr],
  });

  log("NFTPoolBurnAndMint deployed successfilly");
};

module.exports.tags = ["destchain", "all"];
