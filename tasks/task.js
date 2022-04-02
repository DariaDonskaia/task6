const { task } = require("hardhat/config");
const fetch = require("node-fetch");
const { ethers } = require("ethers");

task("deposit", "Add voting tokens")
.addParam("amount", "Count tokens")
.setAction(async function (taskArguments, hre) {
    const dao = await ethers.getContractFactory("DAO");
    DAO = await dao.deploy();  
    await DAO.deposit(taskArguments.address);
    console.log('You add ', taskArguments.address, " tokens!");
});

task("vote", "Vote for the proposal")
.addParam("id", "id proposal for voting")
.addParam("supportAgainst", "Yes or no")
.addParam("amount", "Count tokens")
.setAction(async function (taskArguments, hre) {
    const dao = await ethers.getContractFactory("DAO");
    DAO = await dao.deploy();  
    await DAO.vote(taskArguments.id, taskArguments.supportAgainst, taskArguments.amount);
    console.log('You voted!');
});

task("addProposal", "Mints from the NFT contract")
.addParam("calldata", "The signature")
.addParam("reciption", "The address of the executable contract")
.addParam("description", "The description proposal")
.setAction(async function (taskArguments, hre) {
    const dao = await ethers.getContractFactory("DAO");
    DAO = await dao.deploy();  
    await DAO.addProposal(taskArguments.calldata, taskArguments.reciption, taskArguments.description);
    console.log('You create proposal!');
});

task("finishProposal", "Finish the proposal")
.addParam("id", "id proposal for voting")
.setAction(async function (taskArguments, hre) {
    const dao = await ethers.getContractFactory("DAO");
    DAO = await dao.deploy();  
    await DAO.finishProposal(taskArguments.id);
    console.log('You finished proposal where id = ', taskArguments.id);
});
