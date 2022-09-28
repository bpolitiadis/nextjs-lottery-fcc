import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex);
    const deKinoAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [deKinoState, setDeKinoState] = useState("0");

    const dispatch = useNotification();

    const {
        runContractFunction: enterDeKino,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "enterDeKino",
        params: {},
        msgValue: entranceFee,
    });

    /* View Functions */

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getDeKinoState } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "getDeKinoState",
        params: {},
    });

    async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: deKinoAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayersFromCall = (await getPlayersNumber()).toString();
        const deKinoStateFromCall = await getDeKinoState();
        setEntranceFee(entranceFeeFromCall);
        setNumberOfPlayers(numPlayersFromCall);
        setDeKinoState(deKinoStateFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues();
        }
    }, [isWeb3Enabled]);

    // TODO add some error handling
    const handleSuccess = async (tx) => {
        await tx.wait(1);
        updateUIValues();
        handleNewNotification(tx);
    };

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification Complete",
            position: "topR",
            icon: "bell",
        });
    };

    return (
        <div className="flex flex-col justify-center items-center p-5 align-center" align="center">
            <h1 className="text-gray-900 font-bold tracking-wider py-4 px-4 text-2xl">Welcome to DeKino Decentralized Lottery!</h1>
            {!deKinoState ? (
                <div>
                    {numberOfPlayers > 0 ? (
                        <div className="text-amber-400 font-bold p-12">
                            <div className="text-lg">
                                Lottery is Open! <p>Place your entries!</p>
                            </div>
                            <div className="text-sm text-gray-800 m-2">Next Lottery : {new Date().getHours() + 1}:00</div>
                        </div>
                    ) : (
                        <div className="text-amber-400 font-bold p-12">No Active Lottery</div>
                    )}
                </div>
            ) : (
                <div className="m-12">
                    <div className="text-amber-400 font-bold text-lg p-4 tracking-widest">
                        Lottery is calculating!!!
                    </div>
                    <div className="text-sm">(Chainlink VRF)</div>
                    <div className="text-amber-200 text-sm">
                        No entries allowed at this moment...
                    </div>
                </div>
            )}
            <div>
                {deKinoAddress ? (
                    <>
                        <button
                            align="center"
                            className="bg-lime-400 hover:bg-lime-500 text-brown border-2 border-lime-600 hover:border-lime-500 font-bold py-2 px-4 rounded-full ml-auto"
                            onClick={async () =>
                                await enterDeKino({
                                    // onComplete:
                                    // onError:
                                    onSuccess: handleSuccess,
                                    onError: (error) => console.log(error),
                                })
                            }
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div
                                    aligb="center"
                                    className="animate-spin h-8 w-8 border-b-2"
                                ></div>
                            ) : (
                                <div> Enter DeKino </div>
                            )}
                        </button>
                        <div>
                            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                        </div>
                    </>
                ) : (
                    <div>Please connect to a supported chain </div>
                )}
            </div>
        </div>
    );
}
