import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { NETWORK, PROVIDER } from '../constant';
import {ethers} from "hardhat";
import { ContractName } from './types';
import { artifacts } from 'hardhat';
import { read } from 'fs';
import { add } from 'lodash';
export const getDb = () => low(new FileSync('./address/deployed-contracts.json'));


export const getDbProperty = async (contractId: string, network:string) => {
    // await getDb().read();
    // console.log(network);
    const result = getDb().get(`${contractId}.${network}`).value()
    // console.log(getDb().get(`ReserveLogic.${network}`).value());
    return result
  }

export const getTokenAddress = async (tokenName:string) => {
    let tokenInfo = await getDbProperty(tokenName, NETWORK);
    return tokenInfo;
}

export const getStandardERC20 = async (address: string) => {
    let abi = (await artifacts.readArtifact("contracts/CRT/openzeppelin/ERC20.sol:ERC20")).abi;
    let erc20 = await new ethers.Contract(address, abi, PROVIDER);
    return erc20;
}

export const getTokenContract = async (tokenName: string) => {
    let tokenAddress = (await getTokenAddress(tokenName)).address;
    let tokenContract = await getStandardERC20(tokenAddress);
    return tokenContract;
}

export const getPTokenAddress = async (tokenName:string) => {
    let pToken = 'p' + tokenName;
    // console.log(pToken);
    let pTokenInfo = await getDbProperty(pToken, NETWORK);
    // console.log(pTokenInfo);
    return pTokenInfo;
}

export const getPToken = async (address:string) => {
    let abi = (await artifacts.readArtifact("PToken")).abi;
    let pToken = await new ethers.Contract(address, abi, PROVIDER);
    return pToken;
}

export const getPTokenContract = async (tokenName:string) => {
    let tokenAddress = (await getPTokenAddress(tokenName)).address;
    let pTokenContract = await getPToken(tokenAddress);
    return pTokenContract;
}

export const getVariableDebtToken = async (address:string) => {
    let abi = (await artifacts.readArtifact("VariableDebtToken")).abi;
    let debtToken = await new ethers.Contract(address, abi, PROVIDER);
    return debtToken;
}

export const getCRT = async (address?:string) => {
    let abi = (await artifacts.readArtifact("MockCRT")).abi;
    let crtAddress: string = address || (
        await getDb().get(`${ContractName.CRT}.${NETWORK}`).value()
    ).address
    let crt = await new ethers.Contract(crtAddress, abi, PROVIDER);
    return crt;
}

export const getPrestareOracle = async (address?: string) => {
    let abi = (await artifacts.readArtifact("PrestareOracle")).abi;
    let pTokenAddr:string = address || (
        await getDb().get(`${ContractName.PrestareOracle}.${NETWORK}`).value()
      ).address
    return await new ethers.Contract(pTokenAddr, abi, PROVIDER);
}

export const getCounter = async (address?: string) => {
    let abi = (await artifacts.readArtifact("Counter")).abi;
    let counterAddr = address || (
        await getDb().get(`${ContractName.Counter}.${NETWORK}`).value()
    ).address
    let counter = await new ethers.Contract(counterAddr, abi, PROVIDER);
    return counter;
}

export const getDefaultIRModel = async (address?: string) => {
    let abi = (await artifacts.readArtifact("DefaultReserveInterestRateStrategy")).abi;
    let irAddr = address || 
        (
            await getDb().get(`${ContractName.DefaultReserveInterestRateStrategy}.${NETWORK}`).value()
        ).address
    let irModel = await new ethers.Contract(irAddr, abi, PROVIDER);
    return irModel;
}