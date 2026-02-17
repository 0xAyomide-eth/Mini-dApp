//ill be using this now for importing best method
import Web3 from "web3"

let Chain = document.querySelector(".Chain")
let walletAddress = document.querySelector(".WalletAddress")
let walletConnectBtn = document.querySelector(".WalletConnectBtn")

async function WalletConnect() {
    if (window.ethereum) {
        //initialize new web3 class
        const web3 = new Web3(window.ethereum)

        try {
            const UserAccount = await window.ethereum.request({
                method: "eth_requestAccounts"
            })

            const UserWalletAddress = await web3.eth.getAccounts()
            let shortened = UserWalletAddress.slice(0,6)
            //get the Current Network chain ID
            const ChainID = await web3.eth.getChainId()

            if (ChainID === 1n) {
                Chain.innerHTML = "ETH MAINNET"
                walletConnectBtn.innerHTML = "Connected"
                walletAddress.innerHTML = shortened
            } else {
                //force the user to switch to ETH mainnet
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x1' }],
                    })
                    console.log("switched to eth mainnet")
                    
                }catch(err){
                    console.error("cant switch to mainnet", err)
                    return
                }
            }
        }catch(err){
            console.error("connection failed", err)
        }
    }

}

walletConnectBtn.addEventListener("click",WalletConnect)