const { Connection, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js')
const { Contract, publicKeyToHex } = require('@solana/solidity')
const { readFileSync } = require('fs')

// const ERC20_ABI = JSON.parse(readFileSync('./build/ERC20.json', 'utf8'))
const ERC20_ABI = JSON.parse(readFileSync('./build/abi.abi', 'utf8'))
const BUNDLE_SO = readFileSync('./build/ERC20.so');

(async function () {
        console.log('Connecting to your local Solana node ...')
        const connection = new Connection(
            // works only for localhost at the time of writing
            // see https://github.com/solana-labs/solana-solidity.js/issues/8
            'http://localhost:8899',
            // "https://api.devnet.solana.com",
            'confirmed'
        )

        const payer = Keypair.generate()
        while (true) {

            console.log(publicKeyToHex(payer.publicKey));
            console.log(payer.publicKey);
            console.log('Airdropping (from faucet) SOL to a new wallet ...')
            await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            let abalance = await connection.getBalance(payer.publicKey);
            // console.log(abalance);
            // await connection.requestAirdrop(payer.publicKey, 1 * LAMPORTS_PER_SOL)
            // await new Promise((resolve) => setTimeout(resolve, 1000))
            // abalance = await connection.getBalance(payer.publicKey);
            // console.log(abalance);
            // await connection.requestAirdrop(payer.publicKey, 1 * LAMPORTS_PER_SOL)
            // await new Promise((resolve) => setTimeout(resolve, 1000))
            // abalance = await connection.getBalance(payer.publicKey);
            console.log(abalance);
            if (await connection.getBalance(payer.publicKey)) break


        }

        const address = publicKeyToHex(payer.publicKey)
        const program = Keypair.generate()
        const storage = Keypair.generate()
        // console.log('abi',ERC20_ABI);
        const contract = new Contract(connection, program.publicKey, storage.publicKey, ERC20_ABI, payer)
        // console.log("Contract: ", contract.load);

        try {
            console.log('Deploying the Solang-compiled ERC20 program ...')
            console.log("**********************");
            await contract.load(program, BUNDLE_SO);

            console.log('Program deployment finished, deploying ERC20 ...')
            const ab = await contract.deploy('ERC20', ['GBSolana', 'GBS', '10'], storage, 4096 * 8)
            // console.log(ab);
            let alance = await connection.getBalance(payer.publicKey);
            console.log(alance);
            console.log('Contract deployment finished, invoking contract functions ...')
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            
            const functions = await contract.functions;
            console.log("functions", functions);

            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            const symbol = await contract.symbol();
            const symb = await symbol.result;
            console.log("symbol of the Token :", symbol);

            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            
            const decimals = await contract.decimals();
            const decimal = decimals.result;
            console.log("decimals of the Token :", decimals);

            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            const names = await contract.name();
            const name = names.result;
            console.log("name of the Token :", names);

            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            const total = await contract.totalSupply();
            const supply = total.result;
            console.log("TotalSupply of the Token :",typeof total);
            console.log("TotalSupply of the Token :", total);

            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            const abcd = await contract.name();
            console.log(abcd);

            console.log("*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+*-+");
            // console.log(contract);
            // const add = payer.publicKey;
            // console.log(add.toString())
            // console.log(address);
            // const addr = await add.toJSON()
            // console.log(addr);
            // console.log('adress',address);
            // const minting = await contract.mint(address, '24');
            // console.log("minting",minting);

            console.log(":;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
            const balance = await contract.balanceOf(address);

            console.log(`ERC20 contract for ${symbol} deployed!`)
            console.log(`Wallet at ${address} has a balance of ${balance}.`)

            contract.addEventListener(function (event) {
                console.log(`${event.name} event emitted!`)
                console.log(
                    `${event.args[0]} sent ${event.args[2]} tokens to
           ${event.args[1]}`
                )
            })

            console.log('Sending tokens will emit a "Transfer" event ...')
            const recipient = Keypair.generate()
            await contract.transfer(publicKeyToHex(recipient.publicKey), '1000000000000000000')

            process.exit(0)
        } catch (error) {
            console.log("Error ====================");
            console.log(error);
        }

    })()