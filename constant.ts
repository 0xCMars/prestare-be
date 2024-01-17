import {ethers, network} from 'hardhat';
import { getCounter } from './helpers/contract-getter';
import { Contract } from 'ethers';
import { artifacts } from 'hardhat';

const dotenv = require("dotenv");
dotenv.config();
//Provider

let alchemy_id: string = process.env.ALCHEMY_ID!
// const url: string = "https://eth-mainnet.g.alchemy.com/v2/" + alchemy_id;
const URL: string = "http://120.53.224.174:8545" 
export const PROVIDER = new (ethers.getDefaultProvider as any)(URL);

export const NETWORK = "local";

let COUNTER: Contract;


async function init() {
    let abi = (await artifacts.readArtifact("Counter")).abi;
    let counterAddr = "0xA4aE77554847958aC0854f06601267c9F9C75dfD";
    COUNTER = await new ethers.Contract(counterAddr, abi, PROVIDER);
}

init().catch((e) => console.log(e));

export {COUNTER};
