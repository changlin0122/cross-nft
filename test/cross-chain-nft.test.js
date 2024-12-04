const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { expect } = require("chai");

let firstAccount;
let ccipSimulator;
let nft;
let wnft;
let nftPoolLockAndRelease;
let nftPoolBurnAndMint;
let chainSelector;

before(async function () {
  // prepare variables: contract, account
  firstAccount = (await getNamedAccounts()).firstAccount;
  await deployments.fixture(["all"]);
  ccipSimulator = await ethers.getContract("CCIPLocalSimulator", firstAccount);
  nft = await ethers.getContract("MyToken", firstAccount);
  nftPoolLockAndRelease = await ethers.getContract(
    "NFTPoolLockAndRelease",
    firstAccount
  );
  wnft = await ethers.getContract("WrappedMyToken", firstAccount);
  nftPoolBurnAndMint = await ethers.getContract(
    "NFTPoolBurnAndMint",
    firstAccount
  );
  const config = await ccipSimulator.configuration();
  chainSelector = config.chainSelector_;
});

// source chain -> dest chain
describe("source chain -> dest chain tests", async function () {
  // test if user can mint a nft from nft contract successfully
  it("test if user can mint a nft from nft contract successfully", async function () {
    await nft.safeMint(firstAccount);
    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });

  // test if user can lock the nft in the pool and send ccip message on source chain
  it("test if user can lock the nft in the pool and send ccip message on source chain", async function () {
    await nft.approve(nftPoolLockAndRelease.target, 0);
    await ccipSimulator.requestLinkFromFaucet(
      nftPoolLockAndRelease,
      ethers.parseEther("10")
    );
    await nftPoolLockAndRelease.lockAndSendNFT(
      0,
      firstAccount,
      chainSelector,
      nftPoolBurnAndMint.target
    );
    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(nftPoolLockAndRelease);
  });

  // test if user can get a wrapped nft in dest chain
  it("test if user can get a wrapped nft in dest chain", async function () {
    const owner = await wnft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });
});

// dest chain -> source chain
describe("dest chain -> source chain", async function () {
  // test if user can burn the wnft and send ccip message on dest chain
  it("test if user can burn the wnft and send ccip message on dest chain", async function () {
    await wnft.approve(nftPoolBurnAndMint.target, 0);
    await ccipSimulator.requestLinkFromFaucet(
      nftPoolBurnAndMint,
      ethers.parseEther("10")
    );
    await nftPoolBurnAndMint.burnAndSendNFT(
      0,
      firstAccount,
      chainSelector,
      nftPoolLockAndRelease.target
    );
    const totalSuply = await wnft.totalSupply();
    expect(totalSuply).to.equal(0);
  });

  // test if user have the nft unlocked on source chain
  it("test if user have the nft unlocked on source chain", async function () {
    const owner = await wnft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });
});
