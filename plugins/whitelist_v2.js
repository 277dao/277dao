function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAddressToWhitelist(address) {
    const args = Promise.resolve([address]);
    let tx = await df.submitTransaction({
        args,
        contract: df.getContract(),
        methodName: 'addToWhitelist',
    });
    //await sleep(1000);
    console.log(`whitelist ${address} ${tx.hash}`);
    return tx;
}

async function removeAddressFromWhitelist(address) {
    const args = Promise.resolve([address]);
    let tx = await df.submitTransaction({
        args,
        contract: df.getContract(),
        methodName: 'removeFromWhitelist',
    });
    //await sleep(1000);
    console.log(`blacklist ${address} ${tx.hash}`);
    return tx;
}


class Plugin {
    constructor() {
        this.address_list = [];
        let container = document.createElement('div');
        let whitelist_container = document.createElement('div');
        whitelist_container.style.marginTop = '10px';
        let whitelist_label = document.createElement('label');
        whitelist_label.innerText = 'Whitelist';
        whitelist_label.style.width = '100%';
        let whitelist_input = document.createElement('textarea');
        whitelist_input.style.width = '100%';
        whitelist_input.style.height = '400px';
        whitelist_input.style.fontSize = '16px';
        whitelist_input.style.color = 'black';
        whitelist_input.placeholder = 'address list, one per line';
        whitelist_input.value = "";
        this.whitelist_input = whitelist_input;


        let whitelist_button = document.createElement('button');
        whitelist_button.style.width = '100%';
        whitelist_button.style.height = '26px';
        whitelist_button.innerText = 'to whitelist';
        whitelist_button.onclick = async (evt) => {
            let l = this.whitelist_input.value.split('\n');
            if (l[l.length - 1] === "") {
                l.pop();
            }
            console.log("whitelist", l);
            let gas_price = await df.ethConnection.provider.getGasPrice();
            let csv = "address,transaction\n";
            evt.target.disabled = true;
            for (let i = 0; i < l.length; i++) {
                let address = l[i].trim();
                if (address.length !== 42) {
                    continue;
                }
                gas_price = await df.ethConnection.provider.getGasPrice();
                whitelist_button.innerText = `whitelisting ${address.substring(0, 5)}... ${Math.floor(i / l.length * 100)} %`;
                let tx = df.contractsAPI.contract.addToWhitelist(address, {
                    gasLimit: 1_000_000,
                    gasPrice: Math.ceil(gas_price * 11 / 10),
                });
                await sleep(10_000);
                tx=await tx;
                csv += `${address},${tx.hash}\n`;
                console.log(`whitelist: ${address},${tx.hash}`);
            }
            let fake = document.createElement("a");
            fake.download="result.csv";
            let blob = new Blob([csv]);
            fake.href = URL.createObjectURL(blob);
            await fake.click();
            URL.revokeObjectURL(fake.href);

            whitelist_button.innerText = 'to whitelist';
            evt.target.disabled = false;
        };
        whitelist_container.appendChild(whitelist_label);
        whitelist_container.appendChild(whitelist_input);
        whitelist_container.appendChild(whitelist_button);

        let blacklist_container = document.createElement('div');
        let blacklist_label = document.createElement('label');
        blacklist_label.style.width = '100%';
        blacklist_label.innerText = 'Blacklist';
        let blacklist_row = document.createElement("div");
        let blacklist_input = document.createElement('input');
        blacklist_input.style.width = '70%';
        blacklist_input.placeholder = 'address';
        let blacklist_button = document.createElement('button');
        blacklist_button.style.width = '30%';
        blacklist_button.style.height = '26px';
        blacklist_button.innerText = 'to blacklist';
        blacklist_button.onclick = async (evt) => {
            let address = blacklist_input.value;
            console.log("blacklist", address);
            evt.target.disabled = true;
            blacklist_button.innerText = 'blacklisting...';
            await removeAddressFromWhitelist(address);
            //await sleep(2000);
            blacklist_button.innerText = 'to blacklist';
            evt.target.disabled = false;
        };

        blacklist_row.appendChild(blacklist_input);
        blacklist_row.appendChild(blacklist_button);
        blacklist_container.appendChild(blacklist_label);
        blacklist_container.appendChild(blacklist_row);

        container.appendChild(blacklist_container);
        container.appendChild(whitelist_container);
        this.container = container;
    }


    async render(container) {
        container.appendChild(this.container);
    }

    destroy() {
    }
}

export default Plugin;