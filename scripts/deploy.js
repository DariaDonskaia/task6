const hre = require("hardhat"); 


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);
    const myDAO = await ethers.getContractFactory("DAO");
    const dao = await myDAO.deploy();
    console.log(`Contract deployed to address: ${dao.address}`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});