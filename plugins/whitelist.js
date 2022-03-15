function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAddressToWhitelist(address) {
    const args = Promise.resolve([address]);
    let tx= await df.submitTransaction({
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
            console.log("whitelist", l);
            evt.target.disabled = true;
            for (let i = 0; i < l.length; i++) {
                let a = l[i].trim();
                if (a.length !== 42) {
                    continue;
                }
                whitelist_button.innerText = `whitelisting ${a.substring(0,5)}... ${Math.floor(i / l.length * 100)} %`;
                await addAddressToWhitelist(a);
                //await sleep(2000);
            }
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