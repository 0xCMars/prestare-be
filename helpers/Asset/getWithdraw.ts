import { Request, Response } from 'express';
import { getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken, getDefaultIRModel} from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { getBorrowingEnabled} from "../utils/configParser";
import { getAssetPrice } from '../Dashboard/getData';
import { oneRay } from '../constants';

export const getWithdrawInfoByUser = async (req: Request, res: Response) => {
    let params = req.params;
    let symbol: string = params.tokenSymbol;
    let assetTier: string = params.assetTier;
    let userAddr: string = params.userAddr;
    console.log(`get ${symbol} Info`);
    let token = await getTokenContract(symbol);
    let tokenDeci = await token.decimals();
    let tokenBalance = await token.balanceOf(userAddr);
    let balance = {
        "balance": tokenBalance,
        "decimal": tokenDeci,
    }

    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, assetTier);
    // console.log(reserveInfo);

    let supplyIR = reserveInfo.currentLiquidityRate.mul(10000).div(oneRay);
    let oraclePrice = await getAssetPrice(token.address);
    
    let info = {
        "Balance" : balance,
        "RemainingAPY": (supplyIR / 100).toFixed(2),
        "OraclePrice": oraclePrice,
    }
    res.json(info);
}