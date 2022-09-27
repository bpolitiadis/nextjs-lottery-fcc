import { useEffect, useState } from "react";
import {
    useMoralis,
    useWeb3Contract,
    useWeb3ExecuteFunction,
    useMoralisWeb3Api,
    useNativeBalance,
} from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";

export default function Info() {

    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex);
    const deKinoAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    // State hooks
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");
    const [players, setPlayers] = useState([]);
    // const [contractBalance, setContractBalance] = useState("0");

    /* View Functions */

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayersFromCall = (await getPlayersNumber()).toString();
        const recentWinnerFromCall = await getRecentWinner();
        setEntranceFee(entranceFeeFromCall);
        setNumberOfPlayers(numPlayersFromCall);
        setRecentWinner(recentWinnerFromCall);

        let res,
            options = [];
        setPlayers((players) => []);
        for (let i = 0; i < numPlayersFromCall; i++) {
            options = {
                abi: abi,
                contractAddress: deKinoAddress,
                functionName: "getPlayer",
                params: { index: i },
            };
            res = await Moralis.executeFunction(options);
            setPlayers((players) => [...players, res]);
        }        
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues();
        }
    }, [isWeb3Enabled]);

    return (
        <div className="flex flex-col items-center p-5 bg-slate-600 " align="center">
            <div>
                {deKinoAddress ? (
                    <>
                        {/* <div>
                            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                        </div> */}
                        <div>Last winner was: {recentWinner}</div>
                        <div>The current number of players is: {numberOfPlayers}</div>

                        <div className="bg-slate-300 flex-row sm:flex p-2" align="center">
                            <div>Current entries:</div>
                            <div>
                                {players.map((user, index) => (
                                    <div className=" bg-slate-100 m-4 p-4" key={index}>
                                        Entry {index + 1}: {user}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>Please connect to a supported chain </div>
                )}
            </div>
        </div>
    );
}
