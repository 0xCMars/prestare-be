import express, { Express, NextFunction, Request, Response } from 'express';
// const bodyParser = require("body-parser");
// const cors = require("cors");
import { getTokenContract } from './helpers/contract-getter';
import { PROVIDER } from './constant';
import { Mainnet } from './scripts/markets/mainnet';
import { dashboardGetTokenDeposit, dashboardGetTLV, getDashTokenInfo } from './helpers/Dashboard/getData';
import { getTotalCRT } from './helpers/Dashboard/getTotalCRT';
import { getAssetInfo } from './helpers/Asset/getAssetInfo';
import { getUserInfo } from './helpers/User/getUserInfo';


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

app.get("/dashboard/tokenInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getDashTokenInfo(req, res));

app.get("/assetPage/assetInfo/:tokenSymbol/:assetTier", (req: Request, res: Response) => getAssetInfo(req, res));

// todo 获取用户在某个token上的余额
app.get("/userWallet/:tokenSymbol/:assetTier/:userAddr", (req: Request, res: Response) => getUserInfo(req, res))

// todo 获取用户在某个token上的余额
// todo 获取用户的账户情况

// 设置监听端口
// const PORT = process.env.PORT || 8686;
// app.listen(PORT, () => {
//   console.log(`服务器运行端口： ${PORT}.`);
// });
const PORT = 8686;
app.listen(PORT, "0.0.0.0", () => {
  console.log(` running at http://120.53.224.174:${PORT}`);
});
