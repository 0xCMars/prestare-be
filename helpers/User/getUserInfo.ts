import { Request, Response } from 'express';
import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken, getDefaultIRModel} from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { getLtv, getLiquidationThreshold, getLiquidationBonus, getReserveFactor} from "../utils/configParser";
import { constructTokenRiskName } from '../utils';
import { getAssetPrice } from '../utils/getAssetPrice';

export const getUserInfo =async (req: Request, res: Response) => {
    let params = req.params;
    let userAddr:string = params.userAddr;
    let symbol: string = params.tokenSymbol;
    let assetTier: string = params.assetTier;
    if (assetTier == "C") {
        assetTier = "2"
    } else if (assetTier == "B") {
        assetTier = "1"
    } else if (assetTier == "A") {
        assetTier = "0"
    }
    let assetPrice = await getAssetPrice(symbol, assetTier);

    let token = await getTokenContract(symbol);
    let tokenBalance = await token.balanceOf(userAddr);
    let tokenDecimal = await token.decimals();
    // 获得用户token（DAI）的余额，作为availSupply
    let availSupply = {
        "availAmount": tokenBalance,
        "decimals": tokenDecimal
    }

    let token_Tier = constructTokenRiskName(symbol, Number(assetTier));
    console.log("token", token_Tier);
    let ptoken_Tier = await getPTokenContract(token_Tier);

    let pTokenBalance = await ptoken_Tier.scaledBalanceOf(userAddr);
    let pTokenDecimal = await ptoken_Tier.decimals();
    // 获得用户当前的pToken数量
    let walletBalance = {
        "balance": pTokenBalance,
        "decimal": pTokenDecimal,
    }

    let counter = await getCounter();
    let userAccount = await counter.getUserAccountData(userAddr, assetTier);

    let factor = ethers.utils.parseUnits("1", 8);
    console.log("Available to Borrow: %s $", userAccount.availableBorrowsUSD.div(factor).toString());
    // 获得
    let availBorrow = {
        "availBorrowUSD": userAccount.availableBorrowsUSD,
        "decimals": 8
    } 

    let result = {
        "walletBalance": walletBalance,
        "AvailSupply": availSupply,
        "AvailBorrow": availBorrow,
        "tokenPrice": assetPrice,
    }
    // console.log(result);
    res.json(result);
}