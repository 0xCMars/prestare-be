import express, { Express, NextFunction, Request, Response } from 'express';
// const bodyParser = require("body-parser");
// const cors = require("cors");
import { dashboardGetTokenDeposit, dashboardGetTLV, getDashTokenInfo, getTierTokenListInfo } from './helpers/Dashboard/getData';
import { getTotalCRT } from './helpers/Dashboard/getTotalCRT';
import { getAssetInfo } from './helpers/Asset/getAssetInfo';
import { getUserInfo } from './helpers/User/getUserInfo';
import { getSupplyInfoByUser } from './helpers/Asset/getSupply';
import { getBorrowInfoByUser } from './helpers/Asset/getBorrow';
import { getWithdrawInfoByUser } from './helpers/Asset/getWithdraw';
import { getRepayInfoByUser } from './helpers/Asset/getRepay';
import { getUserSupply } from './helpers/User/getUserSupply';
import { getUserDebt } from './helpers/User/getUserBorrow';
import { getUserCanSupply } from './helpers/User/getUserCanSupply';
import { getUserCanBorrow } from './helpers/User/getUserCanBorrow';
import { getUserPRS } from './helpers/User/getUserPRS';
import { getUserCRT } from './helpers/User/getUserCRT';
import { createServer } from 'https';
import { readFileSync } from "fs";
import http from 'node:http';
const app: Express = express();

var allowCrossDomain = function(req: any, res: any, next: NextFunction) {
  // 允许跨域的主机，这里暂时设置*
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS,HEAD,FETCH");
  res.header("Access-control-max-age", 1000);       //测试通过
  // 如果需要支持cookie，就要加入
  // res.header('Access-Control-Allow-Credentials', true);
  // res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authentication,Origin,Accept,X-Requested-With');
  // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // res.header('X-Powered-By', ' 3.2.1');
  // res.header('Content-Type', 'application/json;charset=utf-8');
  // 自定义header的话web端会先发一个预请求OPTIONS，必须要返回200,告诉前台可以访问
  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
  } else {
      next();
  }
};
app.use(allowCrossDomain);


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

app.get("/market/:assetTier", (req: Request, res: Response) => getTierTokenListInfo(req, res));

app.get("/dashboard/tokenInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getDashTokenInfo(req, res));

app.get("/assetPage/assetInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getAssetInfo(req, res));

// todo 获取用户在某个token上的余额
app.get("/userWallet/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getUserInfo(req, res));

// 用于在操作时展示的界面
app.get("/supplyInfo/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getSupplyInfoByUser(req, res));

app.get("/borrowInfo/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getBorrowInfoByUser(req, res));

app.get("/withdrawInfo/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getWithdrawInfoByUser(req, res));

app.get("/repayInfo/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getRepayInfoByUser(req, res));

// 展示在dashboard your supply/Borrow
app.get("/dashboard/UserAllSupply/:userAddr", (req: Request, res: Response) => getUserSupply(req, res));

app.get("/dashboard/UserAllBorrow/:userAddr", (req: Request, res: Response) => getUserDebt(req, res));

// 展示在Asset to Supply/Borrow
app.get("/dashboard/AssetToSupply/:userAddr", (req: Request, res: Response) => getUserCanSupply(req, res));

app.get("/dashboard/AssetToBorrow/:userAddr", (req: Request, res: Response) => getUserCanBorrow(req, res));

// PRS stake
app.get("/stake/prs/:userAddr", (req: Request, res: Response) => getUserPRS(req, res));

// CRT stake
app.get("/stake/crt/:userAddr", (req: Request, res: Response) => getUserCRT(req, res));

// 设置监听端口
// const PORT = process.env.PORT || 8686;
// app.listen(PORT, () => {
//   console.log(`服务器运行端口： ${PORT}.`);
// });
const PORT = 8686;
const httpsPORT = 8547;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(` running at http://120.53.224.174:${PORT}`);
// });

const options = {
  key: readFileSync('keys/prestare.fun.key'),
  cert: readFileSync('keys/prestare.fun_bundle.crt'),
};

const httpsServer = createServer(options,app);
const server = http.createServer(app)

server.listen(PORT, "0.0.0.0", () => {
  console.log(` running at http://120.53.224.174:${PORT}`);
})

httpsServer.listen(httpsPORT, "0.0.0.0", () => {
  console.log(` running at https://120.53.224.174:${httpsPORT}`);
})
