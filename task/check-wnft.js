const { task } = require("hardhat/config");

task("check-wnft").setAction(async (taskArgs, hre) => {
  const { firstAccount } = await getNamedAccounts();
  const wnft = await ethers.getContract("WrappedMyToken", firstAccount);

  console.log("checking status of MyToken");
  const totalSupply = await wnft.totalSupply();
  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    const owner = await wnft.ownerOf(tokenId);
    console.log(`TokenId: ${tokenId}, owner: ${owner}`);
  }
});

module.exports = {};
