// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { EscrowBase, SafeMath } from "./EscrowBase.sol";

contract EscrowToken is EscrowBase, ERC721("Escrow Investment Service","EIS"), IERC721Receiver{ 
    using SafeMath for uint256;
    uint256 constant public onemonth = 2629743 ; // seconds in 1 epoch month
    uint256 constant public oneyear = 31556926; // seconds in 1 epoch year
   

    constructor(

    ) {
        manager = msg.sender; 
    }


    /* ========== PUBLIC VIEW FUNCTION ========== */

    function getTotalAgreements() external view returns (uint256) {
        return agreements.length;
    }


    function getTotalSent() public view returns (uint256) {
        uint256 sent;
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            sent = sent.add(getAlreadySent(i));
            
        }
        return sent; 
    }

    
    function getTotalMinBasket() public view returns (uint256) {
        uint256 min;
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            // if flow is stopped amountpersec will be 0, this means our contract does not have to alocate Daix to keep the stream going
            if (agreement.amountPerSec != 0) {
                // getting the minimum basket amount based on daipersec
                uint256 minBask = getMinBasket(agreement.amountPerSec, oneyear, 5);
                min = min.add(minBask);
            }
            min = min.add((i));
        }

        return min; 
    }

    function getTotalPending() public view returns (uint256) {
        uint256 pending;
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            pending = pending.add(getPending(i));    
        }
        return pending; 
    }

    /*
     *  Returns the total amount of Dai funded to the contract
     */ 
    function getActiveListingPrice() public view returns(uint256 totalListed) {
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            if (agreement.state == State.FUNDED || agreement.state == State.STOPPED) {
                totalListed = totalListed.add(agreement.listPrice);
            } 
        }
        return totalListed; 
    }

      /*
     *  Returns the total amount of Dai funded to the contract
     */ 
    function getActiveTotalPrice() public view returns(uint256 totalPrice) {
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            if (agreement.state == State.FUNDED || agreement.state == State.STOPPED) {
                totalPrice = totalPrice.add(agreement.totalPrice);
            } 
        }
        return totalPrice; 
    }

    function getTotalDaiPerSecond() public view returns(uint256) {
        uint256 totalPerSecond;
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            totalPerSecond = totalPerSecond.add(agreement.amountPerSec);
        }
        return totalPerSecond; 
    }

    function getTotalPendingSeconds() public view returns(uint256) {
        uint256 totalPendingSec;
        for (uint i= 0; i < agreements.length; i++) {
            Agreement storage agreement = agreements[i];
            uint256 pendingSeconds = agreement.endDate.sub(block.timestamp);
            totalPendingSec = totalPendingSec.add(pendingSeconds);
        }
        return totalPendingSec; 
    }

    function getAgreement(uint256 _id) 
            external 
            view 
            returns (
                uint256 id,
                uint256 endDate,
                uint256 period,
                uint256 listPrice,
                uint256 totalPrice,
                uint256 downpayment,
                uint256 amountPerSecond, 
                uint256 share,
                uint256 amountSent,
                uint256 amountPending,
                address payable buyer,
                address payable seller,
                uint256 state
        ) {
            Agreement storage agreement = agreements[id];

            id = _id;
            endDate = agreement.endDate;
            period = agreement.period;
            listPrice = agreement.listPrice; 
            totalPrice = agreement.totalPrice;
            downpayment = agreement.downpayment;
            amountPerSecond = agreement.amountPerSec;
            share = getShareOfPool(id);
            amountSent = getAlreadySent(id);
            amountPending = getPending(id);
            buyer = agreement.buyer; 
            seller = agreement.seller; 
            state = uint256(agreement.state);
    }

    /*
     *  Returns the share of the agreement of the pool 
     *  this is used to calculate how much interest the agreement acumalated
     *  max share = 1000
     */ 
    function getShareOfPool(uint256 id) public view returns(uint256) {
        Agreement storage agreement = agreements[id];
        uint256 share;
        if(agreement.state == State.MADE) {
            share = 0; 
        } else if (agreement.state == State.FUNDED) {
            share = ( agreement.listPrice.mul(1000) ).div( getActiveListingPrice() );

        } else if (agreement.state == State.STOPPED) {
            share = ( agreement.listPrice.mul(1000) ).div( getActiveListingPrice() );

        } else {
            share = 0;  
        }

        return share; 
    }



    function getAlreadySent(uint256 id) public view returns (uint256) {
        
        Agreement storage agreement = agreements[id];
        uint256 pastSec;
        uint256 totalSec = agreement.period;
        uint256 startTime = (agreement.endDate).sub(totalSec);

        if(agreement.state == State.MADE) {

            return 0; 

        } else if (agreement.state == State.FUNDED) {

            pastSec = block.timestamp.sub(startTime);
            return pastSec.mul(agreement.amountPerSec).add(agreement.downpayment);
            
        } else if (agreement.state == State.STOPPED) {

            return agreement.totalPrice.add(agreement.downpayment);

        } else {
            return agreement.totalPrice.add(agreement.downpayment);
        }
        
    }

    function getPending(uint256 id) public view returns (uint256) {
        Agreement storage agreement = agreements[id];

        if(agreement.state == State.MADE) {

            return agreement.totalPrice; 

        } else if (agreement.state == State.FUNDED) {

            return agreement.totalPrice.add(agreement.downpayment).sub(getAlreadySent(id));
            
        } else if (agreement.state == State.STOPPED) {

            return  agreement.totalPrice.add(agreement.downpayment).sub(getAlreadySent(id));

        } else {
            return 0;
        }
    }



    function getMinBasketSingle(uint256 id) public view returns(uint256){
        Agreement storage agreement = agreements[id]; 
        // calculate based on amount per second to have enough for 35 days
        uint256 min = (agreement.amountPerSec).mul(oneyear);
        
        return min;
    }


    function getMinBasketAll() public view returns(uint256){
        uint256 totalDaiPerSecond = getTotalDaiPerSecond();
        uint256 buffer = totalDaiPerSecond.div(100).mul(15); // 15% buffer

        uint256 min = (totalDaiPerSecond.add(buffer)).mul(oneyear);
        
        return min;
    }

    function getMinBasket(uint daiPerSec, uint256 minPeriod, uint256 bufferPercent) public view returns(uint256){
        uint256 buffer = daiPerSec.div(100).mul(bufferPercent); // 15% buffer
        uint256 min =  (daiPerSec.add(buffer)).mul(minPeriod);
        
        return min;
    }

    
    /* ======= MANAGER FUNCTIONS ===== */

    /**
     * @dev Allow contract owner to update URI to look up all alpaca metadata
     */
    function setURI(uint256 tokenId, string memory _newuri) external onlyManager {
        _setTokenURI(tokenId, _newuri);
    }
    
    /* ========== EXTERNAL MUTABLE FUNCTIONS ========== */

    function mintAgreement(
            uint256 _price,
            uint256 _interestPercent,
            uint256 _downpayment, 
            uint256 _years, 
            address payable _buyer, 
            address payable _seller
        ) external returns(uint256) {
            require(_buyer != _seller, "EscrowBuyer: buyer and seller cant be the same");

            uint256 _principal = _price.sub(_downpayment);
        
            (uint256 _interest , uint256 _totalAmount) = simpleInterest(_principal, _interestPercent);

            Agreement memory _agreement = Agreement({
                period: oneyear.mul(_years), 
                endDate: 0,
                amountPerSec: 0,
                listPrice: _price,
                totalPrice : _totalAmount,
                downpayment : _downpayment,
                buyer: _buyer, 
                seller: _seller, 
                state: State.MADE
            });
        
            agreements.push(_agreement);

            uint256 Id = agreements.length - 1;
            _safeMint(address(this), Id);

    }

    
    /* ========== INTERNAL FUNCTIONS ========== */

    /* 
     *  Mostly helper functions to calculate stuff
     */

   

    function totalSeconds(uint256 _years) internal view returns (uint256) {
           return  _years.mul(oneyear); // calculating the seconds in epoch for amount of years
    }


    function simpleInterest (uint256 principal, uint256 interestpercent) internal view returns (uint256, uint256){
         uint256 _interest = principal.mul(interestpercent.mul(100)).div(10000);
         uint256 _totalAmount = principal.add(_interest);
         return (_interest, _totalAmount);
    }

    function compoundInterest (uint256 principal, uint256 interestRate, uint256 compoundamount, uint256 time) public view returns (uint256, uint256) {
        uint256 _totalAmount = principal.mul(uint256(100).add(interestRate)**time).div(10000000000);
        uint256 _interest = _totalAmount.sub(principal);
        return (_interest, _totalAmount);
    }
    

    function pendingSeconds(uint256 endDate) internal view returns (uint256) {
        uint256 diff = endDate.sub(block.timestamp);
        return diff;
    }

    function pendingAmount(uint256 leftoverSec, uint256 amountPerSec) internal view returns(uint256) {
        uint256 totalPerSec = amountPerSec.mul(leftoverSec);
        return totalPerSec;
    }

    function calcAmountPerSec(uint256 totalPrice, uint256 totalTimeSec) internal view returns(uint256) {
        return totalPrice.div(totalTimeSec);
    }

    /* ===== CALLBACK FUNCTIONS FOR ERC721  ==== */
    
    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        // DO STUFF
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }


}

