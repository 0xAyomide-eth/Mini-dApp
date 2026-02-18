//ill be using this now for importing best method
import Web3 from "web3"

let web3;

let Chain = document.querySelector(".Chain")
let walletAddress = document.querySelector(".WalletAddress")
let walletConnectBtn = document.querySelector(".WalletConnectBtn")
let UserBalance = document.querySelector(".UserBal")
let FirstInput = document.querySelector(".FirstInput")
let LastInput = document.querySelector(".LastInput")
let SendBtn = document.querySelector(".SendBtn")

async function WalletConnect() {
    if (window.ethereum) {
        //initialize new web3 class
        web3 = new Web3(window.ethereum)

        try {
            const UserAccount = await window.ethereum.request({
                method: "eth_requestAccounts"
            })

            let UserWalletAddress = (await web3.eth.getAccounts())[0]
            let UserBalanceBigInt = await web3.eth.getBalance(UserWalletAddress)
            let UserBalanceEth = web3.utils.fromWei(UserBalanceBigInt,'ether')

            

            //get the Current Network chain ID
            const ChainID = await web3.eth.getChainId()

            if (ChainID === 11155111n) {
                Chain.innerHTML = "eth sepolia testnet"
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
                    
                }catch(err){
                    console.error("cant switch to testnet", err)
                    return
                }
            }
        }catch(err){
            console.error("connection failed", err)
        }
    }

}

walletConnectBtn.addEventListener("click",WalletConnect)

async function Transaction() {
    
    let FirstInputAmount = FirstInput.value
    let LastInputAmount = LastInput.value
    let UserWalletAddress = (await web3.eth.getAccounts())[0]
     web3 = new Web3(window.ethereum)

    if(FirstInputAmount === "" && LastInputAmount === "" || FirstInputAmount !== "" && LastInputAmount === "" || FirstInputAmount === "" && LastInputAmount !== "" ){
          console.error("put the user address")
    }else{
        
        let ActualVal = web3.utils.toHex(BigInt(web3.utils.toWei(FirstInputAmount,'ether')))
        const receipt = await web3.eth.sendTransaction({
            from: UserWalletAddress,
            to: LastInputAmount,
            value: ActualVal,
            
        })

        console.log(receipt)
    }

    
}

SendBtn.addEventListener("click",Transaction)

