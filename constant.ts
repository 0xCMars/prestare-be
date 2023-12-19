import {ethers, network} from 'hardhat';
const dotenv = require("dotenv");
dotenv.config();
//Provider

let alchemy_id: string = process.env.ALCHEMY_ID!
// const url: string = "https://eth-mainnet.g.alchemy.com/v2/" + alchemy_id;
const URL: string = "http://120.53.224.174:8545" 
export const PROVIDER = new (ethers.getDefaultProvider as any)(URL);

export const NETWORK = "local";