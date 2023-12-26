import { Request, Response } from 'express';
import { getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken, getDefaultIRModel} from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { getBorrowingEnabled, getLtv} from "../utils/configParser";
import { getAssetPrice } from '../Dashboard/getData';
import { oneRay } from '../constants';

export const getRepayInfoByUser = async (req: Request, res: Response) => {
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

    let oraclePrice = await getAssetPrice(token.address);

    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, assetTier);
    // console.log(reserveInfo);

    let pToken_Tier_debt = await getVariableDebtToken(reserveInfo.variableDebtTokenAddress);
    let pToken_Tier_debt_balance = await pToken_Tier_debt.scaledBalanceOf(userAddr);
    let pToken_debt_deci = await pToken_Tier_debt.decimals();
    let debt = {
        "debtAmount": pToken_Tier_debt_balance,
        "decimals": pToken_debt_deci
    }
    
    let ltvDeci = 2; 
    let assetConfig = await counter.getConfiguration(token.address, assetTier);
    let config = assetConfig.data
    let ltv = {
        "ltv": getLtv(config),
        "decimal": ltvDeci
    }
    
    let userAccount = await counter.getUserAccountData(userAddr, assetTier);
    let userLTV = {
        "ltv": userAccount.ltv.toString(),
        "decimal": ltvDeci
    }

    let info = {
        "Balance" : balance,
        "OraclePrice": oraclePrice,
        "DebtAmount": debt,
        "AssetLTV": ltv,
        "UserLTV": userLTV,
        "CRT": 0
    }

    res.json(info);
}