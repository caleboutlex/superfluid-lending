// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    SuperAppDefinitions,
    IERC20
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";


import {
    EscrowToken,
    SafeMath
} from "./EscrowToken.sol";

import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";



contract EscrowAgent is EscrowToken, IERC777Recipient, IERC777Sender, SuperAppBase {
    using SafeMath for uint256;

    /* ====== SUPERAPP PARAMETERS ==== */

    ISuperfluid private host; // host
    IConstantFlowAgreementV1 private cfa; // the stored constant flow agreement class address
    ISuperToken private acceptedToken; // accepted token
    
    IERC20 public dai;

    /* ====== ERC777 PARAMETERS ==== */
    /*  so we can recive wrapped tokens */

    IERC1820Registry  private erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    
    // keccak256("ERC777TokensSender")
    bytes32 constant private _TOKENS_SENDER_INTERFACE_HASH = keccak256("ERC777TokensSender");

    // keccak256("ERC777TokensRecipient")
    bytes32 constant private _TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    /* ====== Escrow Agent PARAMETERS ==== */

    mapping(uint256 => StreamInfo) public Streams;

    struct StreamInfo {
        uint256 streamId;
        address sender;
        address receiver;
        uint256 timestamp;
        uint256 flowrate;
        uint256 deposit;
        uint256 ownedDeposit;
    }


    constructor(
        ISuperfluid _host,
        IConstantFlowAgreementV1 _cfa,
        ISuperToken _acceptedToken,
        IERC20 _dai
        ) {
        require(address(_host) != address(0), "host is nil");
        require(address(_cfa) != address(0), "cfa is nil");
        require(address(_acceptedToken) != address(0), "superToken1 is nil");

        host = _host;
        cfa = _cfa;
        acceptedToken = _acceptedToken;
        dai = _dai;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
            // SuperAppDefinitions.APP_LEVEL_FINAL |
            // SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            // SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            // SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        host.registerApp(configWord);

        // register interfaces
        erc1820.setInterfaceImplementer(address(this), _TOKENS_SENDER_INTERFACE_HASH, address(this));
        erc1820.setInterfaceImplementer(address(this), _TOKENS_RECIPIENT_INTERFACE_HASH, address(this));

    }

    /* ======= ESCROW AGREEMENT FUNCTIONS ===== */

    function rebalance() external {
        rebalanceAll();
    }


    function fundAgreement(uint256 id) external returns (uint256) {
         // grab a refferance to the agreement in storage
        Agreement storage agreement = agreements[id];
        uint256 allowance = dai.allowance( msg.sender, address(this) );  

        /* Require all the logic */ 
        require(msg.sender == agreement.buyer, "Only the buyer can fund this agreement");
        require(agreement.state != State.FUNDED, "The agreement has already been funded");
        require(allowance >= agreement.listPrice, "msg.sender must approve the contract before funding");

        /* handle the funding */

        // grab the dai from the buyer
        dai.transferFrom(msg.sender, address(this), agreement.listPrice);
        
        require(dai.balanceOf(address(this)) >= agreement.listPrice, "Contract did not recive the list price");

        // set the endDate 
        agreement.endDate = block.timestamp.add(agreement.period);

        // set amountPerSec
        uint256 amountPerSec = agreement.totalPrice.div(agreement.period);
        uint256 buffer = amountPerSec.div(100).mul(15); // 15% buffer

        agreement.amountPerSec = amountPerSec.sub(buffer);

        // change the state to funded
        agreement.state = State.FUNDED; 

        dai.approve(address(acceptedToken), dai.balanceOf(address(this)));
        acceptedToken.upgrade(dai.balanceOf(address(this)));

        if(agreement.downpayment > 0) {
            // send the downpayment to the seller
            acceptedToken.approve(address(this), agreement.downpayment);
            acceptedToken.transferFrom(address(this), agreement.seller, agreement.downpayment);
        }
        

        // // start the flow
        createFlow(id);

        rebalanceAll();

    }

    function closeAgreement(uint256 id) external {
        // grab a refferance to the agreement in storage
        Agreement storage agreement = agreements[id];
        
        /* @dev Require all the logic */ 
        require(agreement.state == State.FUNDED, "State is not funded so we cant close this");
        // require((agreement.endDate - (1 days)) >= block.timestamp, "This can only be closed 24h before the endDate");
        
        // stop the flow 
        // the callback will send the remaining amount to the seller and transfer ownership of the NFT to the buyer
        
        stopFlow(id);    
        
        // get the amounts before we set the state to stopped
        uint256 amountToSend = getPending(id);

        // set State to STOPPED and set amountPerSec to 0. This means the stream is closed (thus stopped) so there is no outflow
        agreement.state = State.STOPPED;
        agreement.amountPerSec = 0;

        rebalanceAll();
        
        // now we need to make shure there is enough DaiX to pay the amount to send;
        // get balances 
        uint256 daiBalance = dai.balanceOf(address(this));
        uint256 daixBalance = realtimeContractDaiXBalance();

        // check if we have these amounts if we need so send something
        if(amountToSend > 0 && daixBalance >=  amountToSend) {
           
            // we have enough daix so we can pay the seller the rest amount
             acceptedToken.approve(address(this), amountToSend);
             acceptedToken.transferFrom(address(this), agreement.seller, amountToSend);

        } else if (amountToSend > 0 && daixBalance <  amountToSend) {

            // we need some more Daix to pay the seller
            uint256 diff = amountToSend.sub(daixBalance);
            dai.approve(address(acceptedToken), dai.balanceOf(address(this)));
            acceptedToken.upgrade(diff);

             // we should now have enough daix so we can pay the seller the rest amount
             acceptedToken.approve(address(this), amountToSend);
             acceptedToken.transferFrom(address(this), agreement.seller, amountToSend);

        } 
        
        _safeTransfer(address(this), agreement.buyer, id, '');
        
        
    }

    function redeemEarnings(uint256 id) external {
        require(ownerOf(id) == msg.sender, 'Only the owner of the NFT can redeem his earnings');
        Agreement storage agreement = agreements[id];
        require(agreement.state == State.STOPPED, 'The agreement must be STOPPED before you can redeem');
        uint256 amountToSend = getHoldings(id);
        acceptedToken.approve(address(this), amountToSend);
        acceptedToken.transferFrom(address(this), msg.sender, amountToSend);
    }

    

    /* ======= PUBLIC VIEW FUNCTIONS ===== */

    function realtimeContractDaiXBalance() public view returns (uint256) {
        (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp) = acceptedToken.realtimeBalanceOfNow(address(this));
        uint256 totalBalance = uint256(availableBalance).add(deposit);

        return totalBalance;
    }

    // function getEarnings(address user) public view returns (uint256) {
    //     uint256 earned;
    //     if (agreements.length !=0) {
    //         for (uint i= 0; i < agreements.length; i++) {
    //             address owner = ownerOf(i);
    //             if (user == owner) {
    //                 earned = earned.add(getHoldings(i));
    //             }        
    //         }
    //         return earned; 

    //     } else {

    //         return 0;
    //     }
    
    // }
    
    /*
     * Intrest earned is being paid to the contract in dai, as this is rebalanced by the contract according to 
     */ 
    function getHoldings(uint256 id) public view returns(uint256) {

        Agreement storage agreement = agreements[id];
        uint256 share = getShareOfPool(id);

        uint256 totalPending = getTotalPending();

        uint256 daixcontractBalance = realtimeContractDaiXBalance();
        uint256 daicontractBalance = dai.balanceOf(address(this));

        uint256 contractBalance = daicontractBalance.add(daixcontractBalance);

        uint256 currentBalance = contractBalance.sub(totalPending);

        if(agreement.state == State.MADE) {

            return 0;
           
        } else if (agreement.state == State.FUNDED) {
            
            return currentBalance.mul(share).div(1000);

        } else if (agreement.state == State.STOPPED) {

            return currentBalance.mul(share).div(1000);
            
        } else {

           return 0;
        }

        return contractBalance.mul(share).div(1000);
              
    }

    function getTotalHoldings() public view returns (uint256 totalHold) {
         for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            if (agreement.state == State.FUNDED || agreement.state == State.STOPPED) {
                totalHold = totalHold.add(getHoldings(i));
            } 
        }
        return totalHold; 
    }

    function getInsolventDate () public view returns (uint256) {
        uint256 totalPerSec = getTotalDaiPerSecond();
        uint256 daixBalance = realtimeContractDaiXBalance();

        if(totalPerSec != 0) {
            uint256 remainingSeconds = daixBalance.div(totalPerSec);
            return (block.timestamp).add(remainingSeconds);

        } else {
            return 0;
        }
        

    }

    /* ======= MANAGER FUNCTIONS ===== */

    function approveAllDaiX() public onlyManager {
        acceptedToken.approve(address(this), acceptedToken.balanceOf(address(this)));
    }

    function approveAllDai() public onlyManager {
        dai.approve(address(this), dai.balanceOf(address(this)));
    }


    function withdrawlAllDaiX() external onlyManager {
        approveAllDaiX();
        acceptedToken.transferFrom(address(this), msg.sender, acceptedToken.balanceOf(address(this)));
    }
    
    function withdrawlAllDai() external onlyManager {
        approveAllDai();
        dai.transferFrom(address(this), msg.sender, dai.balanceOf(address(this)));
    }

    function upgradeAllDai() internal  {
        dai.approve(address(acceptedToken), dai.balanceOf(address(this)));
        acceptedToken.upgrade(dai.balanceOf(address(this)));
        require(dai.balanceOf(address(this))  == 0, 'contract still has dai');
    }

    function downgradeAllDaix() internal  {
        dai.approve(address(acceptedToken), dai.balanceOf(address(this)));
        acceptedToken.downgrade(acceptedToken.balanceOf(address(this)));
        require(acceptedToken.balanceOf(address(this))  == 0, 'contract still has dai');
    }


    /* ======= SUPERAPP CALLBACK HELPER FUNCTIONS ===== */
    
    /**
     * timestamp Timestamp of when the flow is updated.
     * flowRate The flow rate.
     * deposit The amount of deposit the flow.
     * owedDeposit The amount of owed deposit of the flow.
     */
    function _register(
        bytes calldata ctx,
        bytes calldata agreementData,
        bytes32 agreementId,
        address agreementClass
    )
        private
        returns (bytes memory newCtx)
    {   
        // get the address from the stream that has been created 
        (address sender, address receiver) = abi.decode(agreementData, (address, address));
        uint256 id = sliceUint(host.decodeCtx(ctx).userData, 0);

        if (sender == address(this)) {
            // if the address is this contract register the flow 
            (uint256 timestamp, int96 flowRate, uint256 deposit , uint256 ownedDeposit) = IConstantFlowAgreementV1(agreementClass).getFlowByID(acceptedToken, agreementId);
            Streams[id] = StreamInfo(uint256(agreementId), sender, receiver, timestamp, uint256(flowRate), deposit, ownedDeposit );
        }
        newCtx = ctx;
    }


    function _afterClose(bytes calldata ctx, bytes32 agreementId, bytes calldata agreementData) private returns (bytes memory newCtx) {
        // when agreement is closed by the contract we will send the remaining funds to the seller
        uint256 id = sliceUint(host.decodeCtx(ctx).userData, 0);
        // sender of the close function
        address msgSender = host.decodeCtx(ctx).msgSender;
        (address sender, address receiver) = abi.decode(agreementData, (address, address));        
       

        newCtx = ctx;

    }

    /* ======= INTERNAL FUNCTIONS ===== */
    

    /*
     *  Rebalances the pool to 10% DAIx so the stream keeps going
     *   and 90% DAI so we can invest in compound
     */
    function rebalanceAll() internal {
        // this is the amount that the contract must have to be solvent for a year
        uint256 rebalanceAmount = getTotalMinBasket();

        uint256 daixBalance = realtimeContractDaiXBalance();
        
        if(daixBalance < rebalanceAmount) {
            uint256 diff = rebalanceAmount.sub(daixBalance);
            upgradeDai(diff);

        } else if (daixBalance > rebalanceAmount) {
            uint256 diff = daixBalance.sub(rebalanceAmount);
            downgradeDaix(diff);

        }
        
    }


    function upgradeDai(uint256 amount) internal {
        dai.approve(address(acceptedToken), amount);
        acceptedToken.upgrade(amount);
        
    }

    function downgradeDaix(uint256 amount) internal {
        dai.approve(address(acceptedToken), amount );
        acceptedToken.downgrade(amount);
        
    }




    function createFlow(uint256 id) internal {
        Agreement storage agreement = agreements[id];

        host.callAgreement(
              cfa,
              abi.encodeWithSelector(
                  cfa.createFlow.selector,
                  acceptedToken,
                  agreement.seller,
                  agreement.amountPerSec,
                  new bytes(0) // context
              ),
              abi.encodePacked(id)
              
          );
        
    }

    function stopFlow(uint256 id ) internal {
        Agreement storage agreement = agreements[id];
        
        host.callAgreement(
              cfa,
              abi.encodeWithSelector(
                cfa.deleteFlow.selector,
                acceptedToken,
                address(this),
                agreement.seller,
                new bytes(0) // context
              ),
              abi.encodePacked(id)              
          );
     
    }
    /* ======= ERC777 CALLBACK ===== */

    function tokensToSend(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {

        
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        
    }

    /* ======= SUPERAPP CALLBACKS ===== */

     function beforeAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata agreementData,
        bytes calldata ctx
    )
        external view override
        onlyHost
        onlyExpected(superToken, agreementClass)
        returns (bytes memory cbdata)
    {
        // before every agreement created we will rebalance the DaiX amount.
        cbdata = ctx;
    }

    function afterAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata agreementData,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        onlyHost
        returns (bytes memory /*newCtx*/)
    {
        return _register(
            ctx,
            agreementData,
            agreementId,
            agreementClass
        );
    }

     function beforeAgreementUpdated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    )
        external view override
        onlyHost
        onlyExpected(superToken, agreementClass)
        returns (bytes memory cbdata)
    {
        cbdata = ctx;
    }

    function afterAgreementUpdated(
        ISuperToken /* superToken */,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata agreementData,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        return _register(
            ctx,
            agreementData,
            agreementId,
            agreementClass
        );
    }

    function beforeAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata agreementData,
        bytes calldata /*ctx*/
    )
        external view override
        onlyHost
        returns (bytes memory cbdata)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(superToken) || !_isCFAv1(agreementClass)) return abi.encode(true);
        return abi.encode(false);
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 _agreementId,
        bytes calldata _agreementData,
        bytes calldata /*_cbdata*/,
        bytes calldata _ctx
    )
        external override
        onlyHost
        returns (bytes memory)
    {
        // According to the app basic law, we should never revert in a termination callback
        return _afterClose(_ctx, _agreementId, _agreementData);
    }



    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(host), "LotterySuperApp: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "LotterySuperApp: not accepted token");
        require(_isCFAv1(agreementClass), "LotterySuperApp: only CFAv1 supported");
        _;
    }

    function sliceUint(bytes memory bs, uint start)
        internal pure
        returns (uint)
    {
        require(bs.length >= start + 32, "slicing out of range");
        uint x;
        assembly {
            x := mload(add(bs, add(0x20, start)))
        }
        return x;
    }
}