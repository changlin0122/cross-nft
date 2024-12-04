const { task } = require("hardhat/config");

task("check-nft").setAction(async (taskArgs, hre) => {
  const { firstAccount } = await getNamedAccounts();
  const nft = await ethers.getContract("MyToken", firstAccount);

  console.log("checking status of MyToken");
  const totalSupply = await nft.totalSupply();
  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    const owner = await nft.ownerOf(tokenId);
    console.log(`TokenId: ${tokenId}, owner: ${owner}`);
  }
});

module.exports = {};
