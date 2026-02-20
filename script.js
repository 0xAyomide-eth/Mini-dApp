//ill be using this now for importing best method
import Web3 from "web3"

let web3;
let UserWalletAddress;

let CurrentChain = document.querySelector(".CurrentChain")
let walletAddress = document.querySelector(".WalletAddress")
let walletConnectBtn = document.querySelector(".WalletConnectBtn")
let UserBalance = document.querySelector(".UserBal")
let FirstInput = document.querySelector(".FirstInput")
let LastInput = document.querySelector(".LastInput")
let SendBtn = document.querySelector(".SendBtn")
let TxList = document.querySelector(".Tx-list")

//function to make sure the user has sepolia network enabled and the function
//also addes sepolia eth to the users wallet if they dont have it
async function EnsureSepolia() {
    web3 = new Web3(window.ethereum)

    const SepoliaChainID = 11155111
    const SepoliaChainIDhex = web3.utils.toHex(SepoliaChainID)

    //get the current chainID of the user wallet
    const UserChainID = await web3.eth.getChainId()
    if (UserChainID !== SepoliaChainIDhex) {
        //Switches user network to sepolia
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: SepoliaChainIDhex }]
            })
        } catch (err) {//err 4902 if the user doesnt have eth sepolia added then this code adds it for then
            if (err.code === 4902) {
                await window.ethereum.request({
                    chainId: SepoliaChainIDhex,
                    chainName: 'Sepolia',
                    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                })
            } else {
                throw err
            }
        }
    }
}

//function to display past transactions of the user
async function PastTx(){
    web3 = new Web3(window.ethereum)
    
    let key = import.meta.env.VITE_ALCHEMY_KEY
    const alchemyURL = `https://eth-sepolia.g.alchemy.com/v2/${key}`
    UserWalletAddress = (await web3.eth.getAccounts())[0]

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getAssetTransfers",
            params:[{
                fromBlock: "0x0", //starts from the first
                    toBlock: "latest",
                    fromAddress: UserWalletAddress,
                    category: ["external", "erc20"], // ETH and Tokens
                    maxCount: "0x5", // Show last 5 
                    order: "desc" // Newest first
            }]
        })
    }


    const Txdata = await fetch(alchemyURL,requestOptions)
    const data = await Txdata.json()
    const ActualData = data.result.transfers
    const htmlContent = ActualData.map(items=>
        `<div class="tx-card" style="border-bottom: 1px solid #ccc; padding: 10px;">
            <p><b>from:</b>${items.from}</p>
            <p><b>to:</b>${items.to}</p>
            <p><b>Amount(ETH):</b>${items.value}</p>
            <p><b>Tx hash:</b>${items.hash}</p>
        </div>`
    ).join('')

    TxList.innerHTML = htmlContent
}


async function WalletConnect() {
    if (window.ethereum) {
        //initialize new web3 class
        web3 = new Web3(window.ethereum)

        try {
            const UserAccount = await window.ethereum.request({
                method: "eth_requestAccounts" //reversed keyword in JSON in ethereum JSON-RPC API
            })

            await EnsureSepolia()
            await PastTx()

            UserWalletAddress = (await web3.eth.getAccounts())[0]
            let UserBalanceBigInt = await web3.eth.getBalance(UserWalletAddress)
            let UserBalanceEth = web3.utils.fromWei(UserBalanceBigInt, 'ether')



            //get the Current Network chain ID
            const ChainID = await web3.eth.getChainId()

            if (ChainID === 11155111n) {
                CurrentChain.innerHTML = "eth sepolia testnet"
                walletConnectBtn.innerHTML = "Connected"
                walletAddress.innerHTML = UserWalletAddress
                UserBalance.innerHTML = UserBalanceEth

            } else {
                //force the user to switch to eth sepolia testnet
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    })
                    console.log("switched to ethereum sepolia testnet")

                } catch (err) {
                    console.error("cant switch to testnet", err)
                    return
                }
            }
        } catch (err) {
            console.error("connection failed", err)
        }
    }

}

walletConnectBtn.addEventListener("click", WalletConnect)

async function Transaction() {

    let FirstInputAmount = FirstInput.value
    let LastInputAmount = LastInput.value
    UserWalletAddress = (await web3.eth.getAccounts())[0]
    web3 = new Web3(window.ethereum)

    if (FirstInputAmount === "" && LastInputAmount === "" || FirstInputAmount !== "" && LastInputAmount === "" || FirstInputAmount === "" && LastInputAmount !== "") {
        console.error("put the user address")
    } else {
        try {
            let ActualVal = web3.utils.toHex(BigInt(web3.utils.toWei(FirstInputAmount, 'ether')))
            const receipt = await web3.eth.sendTransaction({
                from: UserWalletAddress,
                to: LastInputAmount,
                value: ActualVal,
            })
            console.log(receipt)
        } catch (error) {
            console.error("you have an error:", error.message)
        }

        
    }
}

SendBtn.addEventListener("click", Transaction)

