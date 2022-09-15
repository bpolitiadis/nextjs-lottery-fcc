import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
    const { isLoading, isFetching, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex);
    // console.log(`ChainId is ${chainId}`)
    const deKinoAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const dispatch = useNotification();

    const { runContractFunction: enterDeKino } = useWeb3Contract({
        abi: abi,
        contractAddress: deKinoAddress,
        functionName: "enterDeKino",
        params: {},
        msgValue: entranceFee,
    });

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
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: deKinoAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayersFromCall = (await getPlayersNumber()).toString();
        const recentWinnerFromCall = await getRecentWinner();
        setEntranceFee(entranceFeeFromCall);
        setNumberOfPlayers(numPlayersFromCall);
        setRecentWinner(recentWinnerFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues();
        }
    }, [isWeb3Enabled]);
    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // An example filter for listening for events, we will learn more on this next Front end lesson
    // const filter = {
    //     address: deKinoAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("DeKinoEnter(address)"),
    //     ],
    // }

    // Probably could add some error handling
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
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {deKinoAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
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
                        <div classname="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (<div> Enter DeKino </div>)}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    );
}
