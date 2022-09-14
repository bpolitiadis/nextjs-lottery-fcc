import { useWeb3Contract } from "react-moralis";

export default function LotteryEntrance() {
    const { runContractFunction: enterDeKino } = useWeb3Contract({
        abi: usdcEthPoolAbi,
        contractAddress: usdcEthPoolAddress,
        functionName: "observe",
        params: {},
        msgValue: ""
    });

    return <div>Hi from lottery entrance</div>;
}
