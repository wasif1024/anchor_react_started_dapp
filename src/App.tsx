import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider,useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter,SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json';
import anchor,{Program,Provider,BN,web3} from "@project-serum/anchor";
import { json } from 'stream/consumers';
require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Select the wallets you wish to support, by instantiating wallet adapters here.
             *
             * Common adapters can be found in the npm package `@solana/wallet-adapter-wallets`.
             * That package supports tree shaking and lazy loading -- only the wallets you import
             * will be compiled into your application, and only the dependencies of wallets that
             * your users connect to will be loaded.
             */
            new PhantomWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet=useAnchorWallet();
    const baseAccount=web3.Keypair.generate();
    function getProvider(){
        if(!wallet){
            return null;
        }
        const network="http://127.0.0.1:8899";
        const connection=new Connection(network,"processed");
    const provider=new Provider(connection, wallet,{"preflightCommitment":"processed"});
    //const provider = AnchorProvider.local();
    return provider;    
}
async function initialize(){
    const provider=getProvider();
    //const baseAccount=web3.Keypair.generate();
    if(!provider){
        throw("Provider is null");
    }
    const idlObj=JSON.stringify(idl);
    const idlJsonObj=JSON.parse(idlObj);
    const programObj=new Program(idlJsonObj,idl.metadata.address,provider);
    try{
        await programObj.rpc.initialize({
            accounts:{myAccount:baseAccount.publicKey,
            user:provider.wallet.publicKey,
        systemProgram:web3.SystemProgram.programId},
            signers:[baseAccount]
        });
        const account=await programObj.account.myAccount.fetch(baseAccount.publicKey);
    console.log("account",account);
    }catch(err){
        console.log("Transacion error:",err);
    }
}
async function increment(){
    const provider=getProvider();
    //const baseAccount=web3.Keypair.generate();
    if(!provider){
        throw("Provider is null");
    }
    const idlObj=JSON.stringify(idl);
    const idlJsonObj=JSON.parse(idlObj);
    const programObj=new Program(idlJsonObj,idl.metadata.address,provider);
    try{
        await programObj.rpc.increment({
            accounts:{myAccount:baseAccount.publicKey}
        });
        const account=await programObj.account.myAccount.fetch(baseAccount.publicKey);
    console.log("account",account.data.toString());
    }catch(err){
        console.log("Transacion error:",err);
    }
}
async function decrement(){
    const provider=getProvider();
    //const baseAccount=web3.Keypair.generate();
    if(!provider){
        throw("Provider is null");
    }
    const idlObj=JSON.stringify(idl);
    const idlJsonObj=JSON.parse(idlObj);
    const programObj=new Program(idlJsonObj,idl.metadata.address,provider);
    try{
        await programObj.rpc.decrement({
            accounts:{myAccount:baseAccount.publicKey}
        });
        const account=await programObj.account.myAccount.fetch(baseAccount.publicKey);
    console.log("account",account.data.toString());
    }catch(err){
        console.log("Transacion error:",err);
    }
}
async function update(){
    const provider=getProvider();
    
    if(!provider){
        throw("Provider is null");
    }
    const idlObj=JSON.stringify(idl);
    const idlJsonObj=JSON.parse(idlObj);
    const programObj=new Program(idlJsonObj,idl.metadata.address,provider);
    try{
        await programObj.rpc.update(new BN(100),{
            accounts:{myAccount:baseAccount.publicKey}
        });
        const account=await programObj.account.myAccount.fetch(baseAccount.publicKey);
    console.log("account",account.data.toString());
    }catch(err){
        console.log("Transacion error:",err);
    }
}
    return (
        <div className="App">
            <button onClick={initialize}>Initialize</button>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
            <button onClick={update}>Update</button>
            <WalletMultiButton />
        </div>
    );
};
