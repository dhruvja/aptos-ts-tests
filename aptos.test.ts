var {AptosClient, AptosAccount, CoinClient, FaucetClient} = require("aptos");

const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";
let alice;
let bob;
const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
const coinClient = new CoinClient(client);
const initialFund = 100_000_000;

/*
    Steps for testing
    - Fund the wallet (this takes a lot of time - not prefered in devnet)
    - Run custom transactions and check balance and resources if they are updated.
    - use try and catch extensively to check if the tx is failing or not with appropriate error
*/

// 0x1::aptos_coin::AptosCoin
// 0xb6f4e5b0df6b1e85dd9289ca746d3b7c3a66eff8b18d9d83d3862caf02ab7f21::flip::MyCoin

describe("End to end tests", () => {
    it("Is able to fund the accounts", async() => {
        alice = new AptosAccount();
        bob = new AptosAccount();

        await faucetClient.fundAccount(alice.address(), initialFund);
        await faucetClient.fundAccount(bob.address(), initialFund);

        const aliceBalance = await coinClient.checkBalance(alice);
        const bobBalance = await coinClient.checkBalance(bob);

        expect(aliceBalance.toString()).toBe(initialFund.toString());

    })
  
    it("make a transaction", async() => {
        // For a custom transaction, pass the function name with deployed address
        // syntax: deployed_address::module_name::struct_name
        const payload = {
            arguments: [bob.address(), '717'],
            function: '0x1::coin::transfer',
            type: 'entry_function_payload',
            type_arguments: ['0x1::aptos_coin::AptosCoin'],
        };
        const transaction = await client.generateTransaction(alice.address(), payload);
        const signature = await client.signTransaction(alice, transaction);
        const tx = await client.submitTransaction(signature);
        console.log(tx.hash);
        await client.waitForTransactionWithResult(tx.hash);

    })

    it("get resources", async() => {
        const accountAddress = "b6f4e5b0df6b1e85dd9289ca746d3b7c3a66eff8b18d9d83d3862caf02ab7f21";
        // Pass the account struct to get the particular resource
        // syntax: deployed_address::module_name::struct_name
        const resource = await client.getAccountResource(accountAddress, `${accountAddress}::flip::GameStore`);
        // The resource.data contains the struct data
        console.log(resource.data);
    })

})