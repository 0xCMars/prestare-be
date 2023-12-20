import { getPTokenContract, getTokenContract, getPrestareOracle, getCounter, getPToken, getVariableDebtToken } from "../contract-getter";
import { BigNumber, ethers, Contract } from "ethers";

export const getAssetPrice = async (symbol: string, assetTier: string)  => {
    let priceOrcale = await getPrestareOracle();
    // let oracle_dicimals = ethers.utils.parseUnits("1", 8);
    let asset = await getTokenContract(symbol);
    let asset_price = await priceOrcale.getAssetPrice(asset.address);
    // let asset_decimal = await asset.decimals();
    // let decimal = ethers.utils.parseUnits("1", asset_decimal)
    console.log(asset_price.toString());
    return {
        "priceInUSD": asset_price,
        "decimal": 8
    }

}