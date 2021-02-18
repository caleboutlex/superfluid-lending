const { web3tx, toWad, toBN } = require("@decentral.ee/web3-helpers");

const { expectRevert } = require("@openzeppelin/test-helpers");
const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const deployERC1820 = require("@superfluid-finance/ethereum-contracts/scripts/deploy-erc1820");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const EscrowAgent = artifacts.require("EscrowAgent");

const traveler = require("ganache-time-traveler");
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");
const TEST_TRAVEL_TIME_YEAR = 31556926;
const TEST_TRAVEL_TIME_MONTH = 2629743;


// TODO: remove version
const version = "v1";

contract("EscrowAgent", accounts => {
    const errorHandler = err => {
        if (err) throw err;
    };

    const ZERO_ADDRESS = "0x" + "0".repeat(40);
    accounts = accounts.slice(0, 7);

    const [admin, alice, bob, chris, dave, emma, frank] = accounts;
    const users = {};
    users[admin] = "Admin";
    users[alice] = "Alice";
    users[bob] = "Bob";
    users[chris] = "Chris";
    users[dave] = "Dave";
    users[emma] = "Emma";
    users[frank] = "Frank";

    users[ZERO_ADDRESS] = "0x0";

    let sf;
    let dai;
    let daix;
    let app;
    let wallet;
    let snapshot;
   
    before('Deploy Contracts and init the sdk', async() => {
        const web3Provider = web3.currentProvider;

        if (sf == undefined) {
            await deployFramework(errorHandler, { from: admin });
        }

        if (dai == undefined) {
            await deployTestToken(errorHandler, [":", "fDAI"], {
                web3Provider,
                from: admin
            });
        }

        if (daix == undefined) {
            await deploySuperToken(errorHandler, [":", "fDAI"], {
                web3Provider,
                from: admin
            });
        }
       

        sf = new SuperfluidSDK.Framework({
            web3Provider,
            tokens: ["fDAI"]
        });
        await sf.initialize();

        const daiAddress = await sf.tokens.fDAI.address;
        dai = await sf.contracts.TestToken.at(daiAddress);
        
        daix = sf.tokens.fDAIx;

        var testUnderlying = await daix.getUnderlyingToken();
        console.log("Under: ", testUnderlying, " DAIx: ", daix.address);

        app = await web3tx(EscrowAgent.new, "Deploy EscrowAgent")(
            sf.host.address,
            sf.agreements.cfa.address,
            daix.address,
            testUnderlying,
            {from: admin}
        );
       
        console.log('App address: ', app.address);

        users[app.address] = "App";

        console.log('+/+/+/+/+/+/+/++/+/+/+/+/+/+/++/+/+/+/+/+/+/+  BASIC TEST   +/+/+/+/+/+/+/++/+/+/+/+/+/+/++/+/+/+/+/+/+/+/+/+/+/+/+/+/+')
        console.log('-                            Testing the timeframes without downpayment and interest                                 -')

    });

    beforeEach(async() => {
        snapshot = await traveler.takeSnapshot();
        snapshotId = snapshot['result'];
    });

    afterEach(async() => {
        console.log('<-- Going back to snapshot--> ')
        await traveler.revertToSnapshot(snapshotId);
    });


    
 
    
    async function checkBalance(who) {
        console.log("Balance of ", users[who] || who);
        let daixbalance = (await daix.balanceOf(who)).toString()
        let daibalance = (await dai.balanceOf(who)).toString()

        console.log("DAIx: ", web3.utils.fromWei(daixbalance, 'ether'));
        console.log("DAI: ", web3.utils.fromWei(daibalance, 'ether'));
       
    }

    async function checkBalances(_accounts) {
        console.log('==================> Balances <==================')
        await checkBalance(app.address);

        console.log('- - - - - - - - - - - -')
        for (let i = 0; i < _accounts.length; ++i) {
            await checkBalance(_accounts[i]);
            console.log('- - - - - - - - - - - -')
        }
        console.log('===============================================|')
    }
    
    
    async function getContractInfo() {

        let _totalAgreements = await app.getTotalAgreements({from: admin});

        let _activeListingPrice = await app.getActiveListingPrice({from: admin});
        let _activeTotalPrice = await app.getActiveTotalPrice({from: admin});

        let _totalSent = await app.getTotalSent({from: admin});
        let _totalPending = await app.getTotalPending({from: admin});
        
        let _totalHoldings = 0;//await app.getTotalHoldings({from: admin});
        let _contractBalance = await app.balanceOf( app.address.toString() );
        let _insolventDate = await app.getInsolventDate();

        let _minBasketAll = await app.getMinBasketAll({from: admin});
        let _totalMinBasket = await app.getTotalMinBasket({from: admin});

        let _totalDaiPerSecond = await app.getTotalDaiPerSecond({from: admin});
        let _realtimeDaixBalance = await app.realtimeContractDaiXBalance({from: admin});
        let _daiContractBalance = await dai.balanceOf(app.address, {from: admin});

        let info = {    
                totalAgreements: _totalAgreements.toString(),
                activeListingPrice: _activeListingPrice.toString(),
                activeTotalPrice: _activeTotalPrice.toString(),

                totalSent: _totalSent.toString(),
                totalPending: _totalPending.toString(),
                totalDaiPerSec: _totalDaiPerSecond.toString(),
                daixcontractBalance: _realtimeDaixBalance.toString(),
                daicontractBalance: _daiContractBalance.toString(),
                NFTbalance: _contractBalance.toString(),

                totalHoldings: _totalHoldings.toString(),

                minBasketAll: _minBasketAll.toString(),  
                totalMinBasket: _totalMinBasket.toString(),
                insolventDate: _insolventDate.toString()        
            }

        console.log("<===============>   Contract info   <===================> ");
        console.log(info);
        console.log('========================================================|')

        return info;
    }

    async function getAgreementInfo(id) {

        let data = await app.getAgreement(id);
        let _holdings = 0; //await app.getHoldings(id);
        let _buyerNFTbal = await app.balanceOf( data.buyer.toString() );
       

        let info = {
                id: data.id.toString(),
                endDate: data.endDate.toString(),
                periodInSec: data.period.toString(),
                listPrice: data.listPrice.toString(),
                totalPrice: data.totalPrice.toString(),
                downpayment: data.downpayment.toString(),
                daiPerSec: data.amountPerSecond.toString(),
                share: data.share.toString(),
                holdings: _holdings.toString(),
                amountSent: data.amountSent.toString(),
                amountPending: data.amountPending.toString(),
                buyer: data.buyer.toString(),
                seller: data.seller.toString(),
                buyerNFTbalance: _buyerNFTbal.toString(),
                state: data.state.toString(),

        }

        console.log("<===============> NFT ", id, " info <===================> ");
        console.log(info);
        console.log('=========================================================|')
      

        return info;
    }

    it("is App ? ", async () => {
        const isApp = await sf.host.isApp(app.address);
        console.log("Is app: ", isApp);
        const isJailed = await sf.host.isAppJailed(app.address);
        console.log("Jail: ", isJailed);       
    });


    it('Case 1 - Mint agreement between bob and alice for 5mill over 5 years. Fund and close it ON TIME', async () => {
        
        // mint some dai for alice to fund the purchase
        await dai.mint(alice, web3.utils.toWei('5000000', 'ether'), {from: alice});

        assert(await dai.balanceOf(alice) != 0);

        console.log('===> Mint NFT')
        // mint a NFT representing the agreement between bob and alice
         await app.mintAgreement(
                web3.utils.toWei('5000000', 'ether'),
                '0',
                web3.utils.toWei('0', 'ether'),
                '5',
                alice,
                bob
        );
        await checkBalances(accounts);

        console.log('===> Alice Funds NFT');
        await dai.approve(app.address,  web3.utils.toWei('5000000', 'ether'), {from: alice} );
        await app.fundAgreement(0, {from: alice});

        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);
        console.log('===> Get contract info: ')
        await getContractInfo();
        await checkBalances(accounts);

        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
      
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
       
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
       
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();

        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')
        await checkBalances(accounts);

        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);
        console.log('===> Get contract info: ')
        await getContractInfo();

        console.log('===> Close agreement-------')
        await app.closeAgreement(0, {from: admin});
        
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);
        console.log('===> Get contract info: ')
        await getContractInfo();
        await checkBalances(accounts);

        assert(await daix.balanceOf(bob) ==  web3.utils.toWei('5000000', 'ether') )

    });

    it('Case 2 - Mint agreement between bob and alice for 5mill over 5 years. Fund and close it ONE MONTH TO LATE', async () => {
        
        // mint some dai for alice to fund the purchase
        await dai.mint(alice, web3.utils.toWei('5000000', 'ether'), {from: alice});

        assert(await dai.balanceOf(alice) != 0);

        console.log('===> Mint NFT')
        // mint a NFT representing the agreement between bob and alice
         await app.mintAgreement(
                web3.utils.toWei('5000000', 'ether'),
                '0',
                web3.utils.toWei('0', 'ether'),
                '5',
                alice,
                emma
        );
        console.log('===> Alice Funds NFT')
        await dai.approve(app.address,  web3.utils.toWei('5000000', 'ether'), {from: alice} );
        await app.fundAgreement(0, {from: alice});

        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);

        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
     
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
       
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')
        //console.log('>/< BREAKS HERE! >/<');
        await checkBalances(accounts)
        //console.log('>/< BREAKS HERE! >/<');
        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);
        

        console.log('===> Close agreement-------')
        await app.closeAgreement(0, {from: admin});

        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);

      
        assert(await daix.balanceOf(emma) ==  web3.utils.toWei('5000000', 'ether') )

    });

    it('Case 3 - Mint agreement between bob and alice for 100 dai over 10 years. Fund and close it  - ON TIME ! -', async () => {
        
        // mint some dai for alice to fund the purchase
        await dai.mint(alice, web3.utils.toWei('100', 'ether'), {from: alice});

        assert(await dai.balanceOf(alice) != 0);

        console.log('===> Mint NFT')
        // mint a NFT representing the agreement between bob and alice
         await app.mintAgreement(
                web3.utils.toWei('100', 'ether'),
                '0',
                web3.utils.toWei('0', 'ether'),
                '10',
                alice,
                frank
        );
        console.log('===> Alice Funds NFT')
        await dai.approve(app.address,  web3.utils.toWei('100', 'ether'), {from: alice} );
        await app.fundAgreement(0, {from: alice});
        
        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);


        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
      
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
       
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
       
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')

        console.log('>>>>> :::::: REBALANCE ::::::: <<<<<')
        await app.rebalance();
        
        console.log('------------------------------')
        console.log("///=================>>>>>> go forward in time 1 year");
        await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME_YEAR );
        console.log('------------------------------')
        
       

        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);

        console.log('===> Close agreement-------')
        await app.closeAgreement(0, {from: admin});

        console.log('===> Get contract info: ')
        await getContractInfo();
        console.log('===> Get NFT info: ')
        await getAgreementInfo(0);

    });






});
