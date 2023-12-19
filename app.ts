import express, { Express, Request, Response } from 'express';
// const bodyParser = require("body-parser");
// const cors = require("cors");
import { getTokenContract } from './helpers/contract-getter';
const app: Express = express();
import { PROVIDER } from './constant';
import { Mainnet } from './scripts/markets/mainnet';
import { dashboardGetTokenDeposit, dashboardGetTLV, getDashTokenInfo } from './helpers/Dashboard/getData';
import { getTotalCRT } from './helpers/Dashboard/getTotalCRT';
import { getAssetInfo } from './helpers/Asset/getAssetInfo';
// var corsOptions = {
//   origin: "*"
// };

// app.use(cors(corsOptions));

// // content-type：application/json
// app.use(bodyParser.json());

// // content-type：application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// 简单路由
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "欢迎访问Prestare后端服务器" });
});

app.get("/dashboard/tokenDeposit/:tokenSymbol", (req: Request, res: Response) => dashboardGetTokenDeposit(req, res));

app.get("/dashboard/tvlAmount", (req: Request, res: Response) => dashboardGetTLV(req, res))

app.get("/dashboard/crtAmount", (req: Request, res: Response) => getTotalCRT(req, res));

app.get("/dashboard/tokenInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getDashTokenInfo(req, res));

app.get("/assetPage/assetInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getAssetInfo(req, res));

// todo 获取用户在某个token上的余额
// todo 获取用户的账户情况

// 设置监听端口
const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`服务器运行端口： ${PORT}.`);
// });

app.listen(PORT, () => {
  console.log(` running at http://localhost:${PORT}`);
});
