import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 text-lime-200 font-bold text-3xl"> DeKino Decentralized Lottery </h1>
            <div className="ml-auto py-2 px-10">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
