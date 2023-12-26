import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken } from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { constructTokenRiskName } from "../utils";
import { Mainnet } from '../../scripts/markets/mainnet';
import { Request, Response } from 'express';
import { getAssetTierInfo } from "../Dashboard/getTierAsset";
import { getBorrowingEnabled} from "../utils/configParser";
import { getAssetPrice } from "../Dashboard/getData";

export const getUserDebtBal = async (symbol:string, risk: number, userAddr: string) => {
    let token = await getTokenContract(symbol);
    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, risk);
    let tokenDeci = await token.decimals();
    let p_token_Bal = await token.balanceOf(reserveInfo.pTokenAddress);
    return {
        "Balance": p_token_Bal,
        "decimals": tokenDeci
    }
}

export const getUserCanBorrow = async (req: Request, res: Response) => {
    let params = req.params;
    let userAddr: string = params.userAddr;
    let userSupplyInfo: { [key: string]: any }[] = [];
    for (let [symbol, highrisk] of Object.entries(Mainnet.AssetTier)) {
        console.log(highrisk);
        for (let risk = 2; risk >= Number(highrisk); risk--) {
            console.log(symbol);
            let assetTierInfo = await getAssetTierInfo(symbol, risk);
            let assetBalance = await getUserDebtBal(symbol, risk, userAddr);
            if (assetBalance.Balance.eq(0)) {
                continue
            }
            let token = await getTokenContract(symbol);
            let oraclePrice = await getAssetPrice(token.address);

            let assetInfo = {
                "assetName": assetTierInfo.Name,
                "available": assetBalance,
                "borrowAPY": assetTierInfo.BorrowAPY,
                "price": oraclePrice,
            }
            userSupplyInfo.push(assetInfo)
        }
    }
    console.log(userSupplyInfo);
    res.json({userSupplyInfo});
}