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
    let pToken_Tier_debt = await getVariableDebtToken(reserveInfo.variableDebtTokenAddress);
    let pToken_deci = await pToken_Tier_debt.decimals();
    let pToken_Debt_Bal = await pToken_Tier_debt.scaledBalanceOf(userAddr);
    return {
        "Balance": pToken_Debt_Bal,
        "decimals": pToken_deci
    }
}

export const getUserDebt = async (req: Request, res: Response) => {
    let params = req.params;
    let userAddr: string = params.userAddr;
    let userSupplyInfo: { [key: string]: any }[] = [];
    for (let [symbol, highrisk] of Object.entries(Mainnet.AssetTier)) {
        console.log(highrisk);
        for (let risk = 2; risk >= Number(highrisk); risk--) {
            console.log(symbol);
            let assetTierInfo = await getAssetTierInfo(symbol, risk);
            let userBalance = await getUserDebtBal(symbol, risk, userAddr);
            if (userBalance.Balance.eq(0)) {
                continue
            }
            let token = await getTokenContract(symbol);
            let oraclePrice = await getAssetPrice(token.address);

            let assetInfo = {
                "assetName": assetTierInfo.Name,
                "userDebtBalance": userBalance,
                "borrowAPY": assetTierInfo.BorrowAPY,
                "price": oraclePrice,
            }
            userSupplyInfo.push(assetInfo)
        }
    }
    console.log(userSupplyInfo);
    res.json({userSupplyInfo});
}