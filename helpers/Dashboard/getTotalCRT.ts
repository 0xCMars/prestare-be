import { getCRT } from "../contract-getter";
import {ethers} from "hardhat";
import express, { Express, Request, Response } from 'express';

export const getTotalCRT = async (req: Request, res: Response) => {
    let params = req.params;
    // 获取 Total CRT minded
    let crtToken = await getCRT();
    let crtTotalSupply = await crtToken.totalSupply();
    let crtDecimals = await crtToken.decimals();
    let divfactor = ethers.utils.parseUnits("1", crtDecimals)
    crtTotalSupply = crtTotalSupply.div(divfactor);
    console.log("User Crt total Supply is:", crtTotalSupply);
    res.json({"crtTotalSupply": crtTotalSupply.toNumber()});

}