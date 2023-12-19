export const constructTokenRiskName = (tokenName: string, riskTier: number) => {
    if (riskTier == 2) {
        tokenName = tokenName + "-C";
    } else if (riskTier == 1) {
        tokenName = tokenName + "-B";
    } else if (riskTier == 0) {
        tokenName = tokenName + "-A";
    }
    return tokenName;
}