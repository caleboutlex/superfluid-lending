// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EscrowBase is Ownable {
    using SafeMath for uint256;
    
    /* ===== ERSCROW PARAMETERS ===== */

    /*
     *  address of the manager of the contract
     */
    address public manager; 

    /*
     *  different states a agreement can be in 
     */
    enum State {MADE, FUNDED, STOPPED, CLOSED}


    /*
     *  internal array that holds all the agreements
     */
    Agreement[] internal agreements;

    /*
     *  struct that holds all the info of the agreements
     */
    struct Agreement{
        uint256 period;  
        uint256 endDate; 
        uint256 amountPerSec;
        uint256 listPrice;
        uint256 totalPrice;
        uint256 downpayment;
        address payable buyer; 
        address payable seller;
        State state; 
    }
    
    /* ====== MANAGER FUNCTIONS ====== */

    /*
     *  Sets a new Manager 
     */
    function setManager(address newManager) external onlyManager {
        manager = newManager;

    }

    /* ====== MODIFIERS ====== */
    /*
     *  The manager is the one that controls all the parameters of this contract except the withdrawl function
     *  this is meant to be called by the Buyer only after the period has ended. 
     */
    modifier onlyManager() {
        require(manager == msg.sender, "EscrowBuyer: Only the manager can call this function");
        _; 
    }
    
}