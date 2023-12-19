import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken } from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";
import { constructTokenRiskName } from "../utils";
import { Mainnet } from '../../scripts/markets/mainnet';
import express, { Express, Request, Response } from 'express';

import exp from "constants";

export async function calAssetTotalDeposit(asset: string, highrisk: number) {
    let token = await getTokenContract(asset);
    let tokenTotalDeposit = BigNumber.from(0);
    // 从最低档的资产分类C开始，直到该资产的最高类别
    for (let risk = 2; risk >= highrisk; risk--) {
        let token_risk = constructTokenRiskName(asset, risk);
        let ptoken_risk = await getPTokenContract(token_risk);
        let tokenRiskDeposit = await token.balanceOf(ptoken_risk.address);
        tokenTotalDeposit = tokenRiskDeposit.add(tokenTotalDeposit);
    }
    return tokenTotalDeposit
}

async function calculateTotalAssetUSD(asset: Contract, assetAmount: BigNumber) {
    let priceOrcale = await getPrestareOracle();
    let oracle_dicimals = ethers.utils.parseUnits("1", 8);
    let asset_price = await priceOrcale.getAssetPrice(asset.address);
    let asset_decimal = await asset.decimals();
    console.log("Total DAI is: ", assetAmount);
    console.log("   Price is: ", asset_price);
    let divfactor = ethers.utils.parseUnits("1", asset_decimal)
    let totalAmount = assetAmount.div(divfactor).mul(asset_price).div(oracle_dicimals);
    console.log("Total %s in USD is: %s", await asset.symbol(), totalAmount);
    return totalAmount;
}

export const getTokenTotalAssetUSD = async function (asset: string, highrisk: number) {
    let tokenContract = await getTokenContract(asset);
    // 获取token对应的pToken地址拥有的总量，即有多少token deposit在本协议中
    let totalDeposit = await calAssetTotalDeposit(asset, highrisk);
    // 获取价格预言机上的价格，计算总价格
    let totalAmount = await calculateTotalAssetUSD(tokenContract, totalDeposit);
    return totalAmount;
}

export const dashboardGetTokenDeposit = async (req: Request, res: Response) => {
    let params = req.params;
    let symbol: string = params.tokenSymbol;
    console.log("tokenDeposit");
    let token = await getTokenContract(symbol);
    console.log(await token.symbol());
    // console.log(Mainnet.AssetTier)
    // console.log(Object.entries(Mainnet.AssetTier).keys());
    for (let [asset, highrisk] of Object.entries(Mainnet.AssetTier)) {
      // console.log(asset);
      if (asset == symbol) {
        let totalAmount = await getTokenTotalAssetUSD(asset, highrisk);
        console.log("total:", totalAmount);
        res.json({ "totalAmount": totalAmount.toNumber()});
      }
    }
}

export const dashboardGetTLV = async (req: Request, res: Response) => {
    // let params = req.params;
    // let symbol: string = params.tokenSymbol;
    console.log("GET TVL");
    // let token = await getTokenContract(symbol);
    // console.log(await token.symbol());
    // console.log(Mainnet.AssetTier)
    // console.log(Object.entries(Mainnet.AssetTier).keys());
    let totalTVL: number = 0;
    for (let [asset, highrisk] of Object.entries(Mainnet.AssetTier)) {
        let totalAmount = await getTokenTotalAssetUSD(asset, highrisk);
        console.log("total:", totalAmount);
        totalTVL = totalTVL + totalAmount.toNumber()
    }
    res.json({"totalTVL": totalTVL});
}

export const getDashTokenInfo =async (req: Request, res: Response) => {
    let params = req.params;
    let symbol: string = params.tokenSymbol;
    let assetTier: string = params.assetTier;
    console.log("get %{symbol} Info");
    let token = await getTokenContract(symbol);
    // console.log(await token.symbol());
    // console.log(Mainnet.AssetTier)
    // console.log(Object.entries(Mainnet.AssetTier).keys());
    let counter = await getCounter();
    let reserveInfo = await counter.getReserveData(token.address, assetTier);
    console.log(reserveInfo);
    let ray = ethers.utils.parseUnits("1", 27);
    let supplyIR = reserveInfo.currentLiquidityRate.mul(10000).div(ray);
    let borrowIR = reserveInfo.currentVariableBorrowRate.mul(10000).div(ray);

    let pToken_assetTier = await getPToken(reserveInfo.pTokenAddress);
    let pToken_Supply = await pToken_assetTier.totalSupply(); 
    console.log("pUSDC_C total Supply is", pToken_Supply);
    let pToken_Tier_debt = await getVariableDebtToken(reserveInfo.variableDebtTokenAddress);
    let pToken_Tier_debtSupply = await pToken_Tier_debt.totalSupply();
 
    let info = {
        "SupplyAPY": supplyIR,
        "BorrowAPY": borrowIR,
        "TotalSupply": pToken_Supply,
        "TotalBorrow": pToken_Tier_debtSupply
    }
    res.json(info);
}

