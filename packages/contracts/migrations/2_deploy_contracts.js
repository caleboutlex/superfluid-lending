const { web3tx } = require("@decentral.ee/web3-helpers");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const EscrowAgent = artifacts.require("EscrowAgent");

module.exports = async function(callback, argv) {
  const errorHandler = err => {
    if (err) throw err;
  };

  try {
    global.web3 = web3;

    //const version = process.env.RELEASE_VERSION || "test";
    const version = "v1";

    console.log("release version: ", version);
    /*
    const account = await web3.eth.accounts[0];
    console.log("my account is: ", account);
    console.log("my balance is: ", await web3.eth.getBalance(account));
    */
    const sf = new SuperfluidSDK.Framework({
      chainId: 5,
      version: version,
      web3Provider: web3.currentProvider
    });
    await sf.initialize();

    daiAddress = await sf.resolver.get("tokens.fDAI");
    dai = await sf.contracts.TestToken.at(daiAddress);

    const daixWrapper = await sf.getERC20Wrapper(dai);
    daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress);
 

    console.log("Daix Address :", daix.address);


    const app = await web3tx(EscrowAgent.new, "Deploy EscrowAgent")(
      sf.host.address,
      sf.agreements.cfa.address,
      daix.address,
      daiAddress
    );
    console.log("App deployed at", app.address);
  
  } catch (err) {

  }
};
