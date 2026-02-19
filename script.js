//ill be using this now for importing best method
import Web3 from "web3"

let web3;

let CurrentChain = document.querySelector(".CurrentChain")
let walletAddress = document.querySelector(".WalletAddress")
let walletConnectBtn = document.querySelector(".WalletConnectBtn")
let UserBalance = document.querySelector(".UserBal")
let FirstInput = document.querySelector(".FirstInput")
let LastInput = document.querySelector(".LastInput")
let SendBtn = document.querySelector(".SendBtn")

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



async function WalletConnect() {
    if (window.ethereum) {
        //initialize new web3 class
        web3 = new Web3(window.ethereum)

        try {
            const UserAccount = await window.ethereum.request({
                method: "eth_requestAccounts" //reversed keyword in JSON in ethereum JSON-RPC API
            })

            await EnsureSepolia()

            let UserWalletAddress = (await web3.eth.getAccounts())[0]
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
    let UserWalletAddress = (await web3.eth.getAccounts())[0]
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

