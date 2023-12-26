import { Request, Response } from 'express';
import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken, getDefaultIRModel} from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { getLtv, getLiquidationThreshold, getLiquidationBonus, getReserveFactor} from "../utils/configParser";
import { getAssetPrice } from '../Dashboard/getData';

export const getAssetInfo = async (req: Request, res: Response) => {
    let params = req.params;
    let symbol: string = params.tokenSymbol;
    let assetTier: string = params.assetTier;
    console.log(`get ${symbol} Info`);
    let token = await getTokenContract(symbol);
    let tokenDeci = await token.decimals();
    // console.log(await token.symbol());
    // console.log(Mainnet.AssetTier)
    // console.log(Object.entries(Mainnet.AssetTier).keys());
    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, assetTier);
    console.log(reserveInfo);

    // ReserveSize 
    let pToken_assetTier = await getPToken(reserveInfo.pTokenAddress);
    let pTokenSupply = await pToken_assetTier.scaledTotalSupply();
    let pToken_deci = await pToken_assetTier.decimals();
    let reserveSize = {
        "ReserveSize": pTokenSupply,
        "decimals": pToken_deci
    }

    let ray = ethers.utils.parseUnits("1", 27);
    let supplyIR = reserveInfo.currentLiquidityRate.mul(10000).div(ray).toNumber();
    let borrowIR = reserveInfo.currentVariableBorrowRate.mul(10000).div(ray).toNumber();

    let assetConfig = await counter.getConfiguration(token.address, assetTier);
    let config = assetConfig.data
    let MaxLtv = (getLtv(config) / 100).toFixed(2);
    let LiqThreshold = (getLiquidationThreshold(config) / 100).toFixed(2);
    let LiqBonus = (getLiquidationBonus(config) / 100).toFixed(2);
    let reserveFac = (getReserveFactor(config) / 100).toFixed(2);
    console.log("MAX LTV: %d %", MaxLtv);
    console.log("LiquidationThreshold %d %", LiqThreshold);
    console.log("Liquidation Bonus %d %", LiqBonus);
    console.log("Reserve Factor %d %", reserveFac);

    // Available Liquidity
    let avaliableLiquidity = await token.balanceOf(reserveInfo.pTokenAddress);
    let availLiq = {
        "AvailableLiquidity": avaliableLiquidity,
        "decimals": tokenDeci
    }

    // Oracle Price
    let oraclePrice = await getAssetPrice(token.address);

    let pToken_Tier_debt = await getVariableDebtToken(reserveInfo.variableDebtTokenAddress);
    let totalVariableDebt = (await pToken_Tier_debt.scaledTotalSupply()).mul(reserveInfo.variableBorrowIndex).div(ray);
    // console.log(avaliableLiquidity);
    // console.log(totalVariableDebt);
    // 保留两位小数
    let Utilization  = 0;
    if (totalVariableDebt.eq(0)) {
        Utilization = 0;
    } else {
        Utilization = totalVariableDebt.mul(10000).div(avaliableLiquidity.add(totalVariableDebt)).toNumber();
    }
    
    console.log("Utilization rate: %d %", (Utilization / 100).toFixed(2));

    // 曲线图，利用率导致利率变化的图
    let irStrategy = await getDefaultIRModel(reserveInfo.interestRateStrategyAddress);
    let variableRateSlope1 = await irStrategy.variableRateSlope1();
    let variableRateSlope2 = await irStrategy.variableRateSlope2();
    let OPTIMAL_UTILIZATION_RATE = await irStrategy.OPTIMAL_UTILIZATION_RATE();

    let varSlop1 = variableRateSlope1.mul(100).div(ray).toNumber() / 100;
    let varSlop2 = variableRateSlope2.mul(100).div(ray).toNumber() / 100;
    let opti_rate = (OPTIMAL_UTILIZATION_RATE.mul(100).div(ray).toNumber() / 100)
    console.log("variableRateSlope1 is: ", varSlop1.toFixed(2));
    console.log("variableRateSlope2 is: ", varSlop2.toFixed(2));
    console.log("OPTIMAL_UTILIZATION_RATE is: ", opti_rate.toFixed(2));

    let info = {
        "ReserveSize" : reserveSize,
        "AvailableLiquidity": availLiq,
        "OraclePrice": oraclePrice,
        "SupplyAPY": (supplyIR / 100).toFixed(2),
        "MaxLtv": MaxLtv,
        "LiquidationThresold": LiqThreshold,
        "LiquidationBonus": LiqBonus,
        "BorrowAPY": (borrowIR / 100).toFixed(2),
        "ReserveFactor": reserveFac,
        "UtilizationRate": Utilization / 100,
        "variableRateSlope1": varSlop1,
        "variableRateSlope2": varSlop2,
        "OPTIMAL_UTILIZATION_RATE": opti_rate
    }
    res.json(info);
}