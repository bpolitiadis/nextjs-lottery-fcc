import { useEffect, useState } from "react";
import {
    useMoralis,
    useWeb3Contract,
    useWeb3ExecuteFunction,
    useMoralisWeb3Api,
    useNativeBalance,
} from "react-moralis";
import { abi, contractAddresses } from "../constants";

export default function Info() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const deKinoAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    // State hooks
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");
    const [players, setPlayers] = useState([]);

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
        <div className="flex flex-col items-center p-5" align="center">
            <div>
                {deKinoAddress ? (
                    <>
                        <div>Last winner was: {recentWinner}</div>
                        <div>The current number of players is: {numberOfPlayers}</div>
                        {numberOfPlayers > 0 ? (
                            <div
                                className="bg-teal-500 flex-row p-2 border border-dashed rounded-lg border-teal-900 bg-teal-100"
                                align="center"
                            >
                                <div align="center">Current entries:</div>
                                <div>
                                    {players.map((user, index) => (
                                        <div
                                            className=" bg-teal-200 border border-teal-800 rounded-md m-4 p-4"
                                            key={index}
                                        >
                                            Entry {index + 1}: {user}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </>
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    );
}
