// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DAO is AccessControl{
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    
    struct ProposalToken{
        address _chairPerson;
        bool _activeProposal;
        uint _beginTime;
        uint _agree;
        uint _nagree;
        address _reciption;
        string _description;
        bytes _data;
    }

    struct VoteToken{
        uint _idProposal;
        address _votePerson;
        bool _supportAgainst;
        uint _amount;
        uint _lastTimeVote;
    }

    Counters.Counter idProposal;

    VoteToken[] public votes;
    mapping(address => VoteToken) public Vote;
    mapping(uint => ProposalToken) public Proposal;
    mapping(address => uint256) public AmountVote;

    event AddProposalEvent(bytes callData_, address reciption_, string description_); 
    event VoteEvent(address from, uint id, bool supportAgainst, uint amount);
    event FinishProposalEvent(address from, uint id);

    address public chairPerson;
    address private voteToken;
    uint public minimumQuorum;
    uint public debatingPeriodDurtion;
    
    bytes32 public constant CHAIR_ROLE = keccak256("CHAIR_ROLE");

    constructor(address chairPerson_, address voteToken_, uint minimumQuorum_, uint debatingPeriodDurtion_){
        _setupRole(CHAIR_ROLE, chairPerson_);
        chairPerson = chairPerson_;
        voteToken = voteToken_;
        minimumQuorum = minimumQuorum_;
        debatingPeriodDurtion = debatingPeriodDurtion_;
    }

    function deposit(uint256 amount) public {
        require(IERC20(voteToken).balanceOf(msg.sender) > amount, "DAO: Your balance less amount");    
        IERC20(voteToken).transferFrom(msg.sender, address(this), amount);
        AmountVote[msg.sender] += amount; 
    }

    function getToken(address reception) view public returns(uint256) { 
        return AmountVote[reception]; 
    }    

    function addProposal(bytes memory callData_, address reciption_, string memory description_) public { 
        require(hasRole(CHAIR_ROLE, msg.sender), "DAO: Caller is not a chairman");
        Counters.increment(idProposal);
        Proposal[idProposal.current()] = ProposalToken({_chairPerson: msg.sender, _activeProposal: true, _agree:0, _nagree:0, _description:description_, _reciption: reciption_, _data: callData_, _beginTime: block.timestamp});
        emit AddProposalEvent(callData_, reciption_, description_);
    }

    function vote(uint id, bool supportAgainst, uint amount) public {
        require(amount <= AmountVote[msg.sender], "DAO: Amount more than balance");
        require(Vote[msg.sender]._idProposal != id  , "DAO: You are vote");
        require(Proposal[id]._activeProposal == true, "DAO: Proposal finished");
        votes.push(VoteToken({_idProposal: id, _votePerson: msg.sender, _supportAgainst: supportAgainst, _amount: amount, _lastTimeVote: block.timestamp }));
        if (supportAgainst){
            Proposal[id]._agree +=1;   
        }
        else{
            Proposal[id]._nagree +=1;  
        }
        emit VoteEvent(msg.sender, id, supportAgainst, amount);
    }

    function finishProposal(uint id) public {
        require(Proposal[id]._activeProposal == true, "DAO: Proposal finished");
        require(block.timestamp > Proposal[id]._beginTime + debatingPeriodDurtion, "DAO: Proposal doesn't finish"); 

        require(Proposal[id]._nagree + Proposal[id]._agree >= minimumQuorum, "DAO: The count of tokens is less than the minimum quorum");

        if (Proposal[id]._agree > Proposal[id]._nagree) {
            (bool success, ) = Proposal[id]._reciption.call{value: 0}(Proposal[id]._data);
        }

        Proposal[id]._activeProposal = false;
        emit FinishProposalEvent(msg.sender, id);
    }

    function withdraw() public {
        require(AmountVote[msg.sender] > 0, "DAO: Your balance is empty");
        require(block.timestamp > Vote[msg.sender]._lastTimeVote + debatingPeriodDurtion + 3 days, "DAO: Not much time has passed since the last vote");
        IERC20(voteToken).transfer(msg.sender, AmountVote[msg.sender]);
    }
}