import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken } from "../contract-getter";
import { Mainnet } from '../../scripts/markets/mainnet';
import { Request, Response } from 'express';
import { getAssetTierInfo } from "../Dashboard/getTierAsset";
import { getBorrowingEnabled} from "../utils/configParser";
import { getAssetPrice } from "../Dashboard/getData";
import { COUNTER } from "../../constant";

export const getUserHaveBal = async (symbol:string, userAddr: string) => {
    let token = await getTokenContract(symbol);
    // let counter = await getCounter();
    let token_deci = await token.decimals();
    let tokenBalance = await token.balanceOf(userAddr);
    return {
        "Balance": tokenBalance,
        "decimals": token_deci
    }
}

export const getAssetConfiguration = async (symbol:string, risk: string) => {
    // let counter = await getCounter();
    let token = await getTokenContract(symbol);
    let assetConfig = await COUNTER.getConfiguration(token.address, risk);
    let config = assetConfig.data;
    return config;
}

export const getUserCanSupply = async (req: Request, res: Response) => {
    let params = req.params;
    let userAddr: string = params.userAddr;
    let userSupplyInfo: { [key: string]: any }[] = [];
    for (let [symbol, highrisk] of Object.entries(Mainnet.AssetTier)) {
        console.log(highrisk);
        for (let risk = 2; risk >= Number(highrisk); risk--) {
            console.log(symbol);
            let assetTierInfo = await getAssetTierInfo(symbol, risk);
            let userBalance = await getUserHaveBal(symbol, userAddr);
            if (userBalance.Balance.eq(0)) {
                continue
            }
            let token = await getTokenContract(symbol);
            let assetConfig = await getAssetConfiguration(symbol, String(risk));
            let collateralization = getBorrowingEnabled(assetConfig);
            let oraclePrice = await getAssetPrice(token.address);

            let assetInfo = {
                "assetName": assetTierInfo.Name,
                "userTokenBalance": userBalance,
                "supplyAPY": assetTierInfo.SupplyAPY,
                "price": oraclePrice,
                "collateralization": collateralization
            }
            userSupplyInfo.push(assetInfo)
        }
    }
    console.log(userSupplyInfo);
    res.json({userSupplyInfo});
}