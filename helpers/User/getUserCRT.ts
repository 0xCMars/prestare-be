import { Request, Response } from 'express';

export const getUserCRT = async (req: Request, res: Response) => {
    let params = req.params;
    let userAddr: string = params.userAddr;

    let crt = {
        "Price": {
            "price":780000,
            "decimal": 6,
        },
        "Staked": {
            "Amount": 2000000000,
            "decimal": 8
        },
        "Wallet": {
            "Amount": 3500000000,
            "decimal": 8
        },
        "stakingAPR": {
            "APR":1000,
            "decimal": 2
        },
        "totalStake": {
            "totalStake":500000000,
            "decimal": 8
        },
        "totalSupply": {
            "totalStake":1000000000,
            "decimal": 8
        }
    }
    // console.log(prs);
    res.json({crt});
}