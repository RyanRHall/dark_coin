const { TestHelper } = require("zos");
const { Contracts, ZWeb3 } = require("zos-lib");
const truffleAssert = require("truffle-assertions");


ZWeb3.initialize(web3.currentProvider);

const DarkCoinContract = Contracts.getFromLocal("DarkCoin");
const ERC20 = Contracts.getFromNodeModules("openzeppelin-eth", "ERC20");

contract("DarkCoin", accounts => {

  beforeEach(async function () {
    this.project = await TestHelper();
    // this.DarkCoinProxy = await this.project.createProxy(DarkCoinContract); TODO - this is silly
    this.DarkCoinProxy = await this.project.createProxy(DarkCoinContract, { initMethod: 'initialize', initArgs: [] });
  })

  it("should initialize with no coins", async function () {
    let initialSupply = await this.DarkCoinProxy.methods.totalSupply().call();
    initialSupply = parseInt(initialSupply);
    assert.equal(initialSupply, 0);
  })

  it("should allow users to buy coins", async function () {
    await this.DarkCoinProxy.methods.buy().send({ value: 1000, from: accounts[1] });
    // mints 1 coin
    let initialSupply = await this.DarkCoinProxy.methods.totalSupply().call();
    initialSupply = parseInt(initialSupply);
    assert.equal(initialSupply, 1);
    // user owns that coin
    const balance = await this.DarkCoinProxy.methods.balanceOf(accounts[1]).call();
    assert.equal(balance, 1);
  })

  it("should increase price after purchase", async function () {
    let price = await this.DarkCoinProxy.methods.currentPrice().call();
    assert.equal(price, 1000);
    // price increases
    await this.DarkCoinProxy.methods.buy().send({ value: 1000, from: accounts[1] });
    price = await this.DarkCoinProxy.methods.currentPrice().call();
    assert.equal(price, 1100);
    // price increases again
    await this.DarkCoinProxy.methods.buy().send({ value: 1100, from: accounts[1] });
    price = await this.DarkCoinProxy.methods.currentPrice().call();
    assert.equal(price, 1200);
  })

  it("should not allow users to buy more than the max # of coins", async function () {
    // buy all the coins
    for (var i = 0; i < 666; i++) {
      await this.DarkCoinProxy.methods.buy().send({ value: 1000000000, from: accounts[1] });
    }
    // check supply
    let initialSupply = await this.DarkCoinProxy.methods.totalSupply().call();
    initialSupply = parseInt(initialSupply);
    assert.equal(initialSupply, 666);
    // revert when trying to mint new coin
    await truffleAssert.reverts(
      this.DarkCoinProxy.methods.buy().send({ value: 1000000000, from: accounts[1] })
    );
  })
})
