const { expect } = require("chai");
const { ethers, waffle, network} = require("hardhat");
const provider = waffle.provider;
const { parseEther } = require("ethers/lib/utils");


describe("DAO contract", function () {

    beforeEach(async function () {
      const BALANCE = parseEther('10');
      primaryTotalSupply = parseEther("10000");
      [owner, addr1, addr2, addr3, chairman, ...addrs] = await ethers.getSigners();

      dao = await ethers.getContractFactory("DAO");
      erc20 = await ethers.getContractFactory("ITokenERC20"); 
      test = await ethers.getContractFactory("executeContract");

      Test = await test.connect(owner).deploy(10);
      myERC20 = await erc20.connect(owner).deploy(1000);
      myDAO = await dao.connect(addr2).deploy(chairman.address, myERC20.address, 1, 2); 
      await myERC20.connect(owner).mint(addr2.address, 100);   

    });
  
    
    describe("Test base function in DAO contract", function () {

      it("DAO contract: Test deposit() function", async function () {
        await myERC20.connect(addr2).approve(myDAO.address, 10);
        await myDAO.connect(addr2).deposit(10);
        balance = await myERC20.connect(addr2).balanceOf(addr2.address);
        expect(await myDAO.connect(addr2).getToken(addr2.address)).to.equal(10);
        await expect(myDAO.connect(addr2).deposit(100000000)).to.be.revertedWith("DAO: Your balance less amount");
      });

      it("DAO contract: Test addProposal() function", async function () {
        const signature = [{
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "testFunc",
          "outputs": [],
          "stateMutability": "view",
          "type": "function"
      }];
        
        const jsonFunc = new ethers.utils.Interface(signature);
        const calldata = jsonFunc.encodeFunctionData("testFunc", [10]);
        await myDAO.connect(chairman).addProposal(calldata, Test.address, "testFunc");
        await expect(myDAO.connect(addr2).addProposal(calldata, Test.address, "testFunc")).to.be.revertedWith("DAO: Caller is not a chairman");
      });


      it("DAO contract: Test vote() function", async function () {
        const signature = [{
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "testFunc",
          "outputs": [],
          "stateMutability": "view",
          "type": "function"
      }];
        
        const jsonFunc = new ethers.utils.Interface(signature);
        const calldata = jsonFunc.encodeFunctionData("testFunc", [10]);
        await myDAO.connect(chairman).addProposal(calldata, Test.address, "testFunc");
        
        await myERC20.connect(addr2).approve(myDAO.address, 30);
        await myDAO.connect(addr2).deposit(30);
         
        await myDAO.connect(addr2).vote(1, false, 10 );        
        await expect(myDAO.connect(addr2).vote(1, false, 1000 )).to.be.revertedWith("DAO: Amount more than balance");
      });

      
      it("DAO contract: Test finishProposal() function", async function () {
        
        const signature = [{
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "testFunc",
          "outputs": [],
          "stateMutability": "view",
          "type": "function"
      }];
        
        const jsonFunc = new ethers.utils.Interface(signature);
        const calldata = jsonFunc.encodeFunctionData("testFunc", [10]);
        await myDAO.connect(chairman).addProposal(calldata, Test.address, "testFunc");
        
        await myERC20.connect(addr2).approve(myDAO.address, 30);
        await myDAO.connect(addr2).deposit(30);
         
        await myDAO.connect(addr2).vote(1, false, 10 ); 
           
        //await ethers.provider.send("evm_setNextBlockTimestamp", [1648890915*2])
        //await ethers.provider.send("evm_mine")
        await myDAO.connect(addr2).finishProposal(1);

        await expect(myDAO.connect(addr2).finishProposal(1)).to.be.revertedWith("DAO: Proposal finished");
    });
  });
});