import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken } from "../contract-getter";
import { oneRay } from "../constants";
import { constructTokenRiskName } from "../utils";

export const getAssetTierInfo = async (symbol: string, assetTier: number) => {
    console.log(`get ${symbol} Info`);
    let token = await getTokenContract(symbol);
    let tokenAssetSym = constructTokenRiskName(symbol ,assetTier)
    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, assetTier);
    // console.log(reserveInfo);
    let supplyIR = reserveInfo.currentLiquidityRate.mul(10000).div(oneRay);
    let borrowIR = reserveInfo.currentVariableBorrowRate.mul(10000).div(oneRay);

    let pToken_assetTier = await getPToken(reserveInfo.pTokenAddress);
    let pTokenName = await pToken_assetTier.symbol();
    let pToken_Supply = await pToken_assetTier.totalSupply();
    let pTokenDeci = await pToken_assetTier.decimals();
    let supply = {
        "Amount": pToken_Supply,
        "Decimal": pTokenDeci
    }
    console.log("pToken_Supply total Supply is", pToken_Supply);
    let pToken_Tier_debt = await getVariableDebtToken(reserveInfo.variableDebtTokenAddress);
    let pToken_Tier_debtSupply = await pToken_Tier_debt.totalSupply();
    let pToken_Tier_debtDeci = await pToken_Tier_debt.decimals();
    let debt = {
        "Amount": pToken_Tier_debtSupply,
        "Decimal": pToken_Tier_debtDeci
    }
    let assetInfo = {
        "Name": tokenAssetSym,
        "SupplyAPY": supplyIR,
        "BorrowAPY": borrowIR,
        "TotalSupply": supply,
        "TotalBorrow": debt
    }
    return assetInfo
}