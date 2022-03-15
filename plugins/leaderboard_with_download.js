function print_score(players) {
    console.log(`total ${players.length}`);
    for (let player of players) {
        console.log(`${player.player}: ${player.score}`)
    }
}

function sort_players(m) {
    let a = Array.from(m);
    a.sort((a, b) => {
        return b[1] - a[1]
    });
    return a;
}


function create_head() {
    let row = document.createElement("tr");
    row.style.width = '100%';
    row.style.height = '26px';
    for (let i = 0; i < 3; i++) {
        let field = document.createElement("th");
        row.appendChild(field);
    }
    row.children[0].innerHTML = "place";
    row.children[1].innerHTML = "player";
    row.children[2].innerHTML = "score";

    //row.children[0].style.width = "100px";// no effect
    row.children[0].style.width = "40px";
    row.children[1].style.width = "146px";
    row.children[2].style.width = "80px";
    //row.children[2].innerHTML = "junk";
    return row;
}

function create_row() {
    let row = document.createElement("tr");
    row.style.width = '100%';
    row.style.height = '26px';
    let rank = document.createElement('td');
    rank.style.textAlign = "right";
    row.appendChild(rank);
    let user = document.createElement("td");
    user.style.maxWidth = "146px";
    user.style.overflow = "hidden";
    row.appendChild(user);
    let score = document.createElement("td");
    score.style.textAlign = "right";
    row.appendChild(score);
    return row;
}


function timestampSection(value) {
    return value.toString().padStart(2, '0');
}


class Plugin {
    constructor() {
        this.begin_time = 1647331200534;
        this.end_time = 1647763200534;
        this.csv_content = "";
        let container = document.createElement("div");
        let row = document.createElement("div");
        this.timer = document.createElement("span");
        this.timer.style.width = '70%';
        this.timer.style.textAlign = "center";
        this.timer.style.display = "inline-block";
        let download_button = document.createElement("a");
        download_button.style.width = '30%';
        download_button.style.textAlign = "right";
        download_button.innerText = "download";
        download_button.download = "leaderboard.csv";
        row.appendChild(this.timer);
        row.appendChild(download_button);
        this.download_button = download_button;


        this.table = document.createElement("table");
        //this.table.style.width = '100%';
        this.table.style.maxHeight = '300px';
        this.table.style.display = 'block';
        this.table.style.borderSpacing = '8px 0';// take effect only when borderCollapse is `separate`
        this.table.style.borderCollapse = 'separate';
        this.table.style.overflow = "scroll";
        //this.table.style. tableLayout="fixed";
        // this.table.style.height = '26px';
        //this.table.style.textAlign = "right";
        this.table.appendChild(create_head());
        let n = df.getAllPlayers().length;
        for (let i = 0; i < n; i++) {
            this.table.appendChild(create_row());
        }
        this.n = n;
        this.scoreboard = new Map();

        this.refresh_button = document.createElement("button");
        this.refresh_button.style.width = "100%";
        this.refresh_button.style.height = '26px';
        this.refresh_button.innerText = "refresh";
        this.refresh_button.onclick = this.update_players;

        container.appendChild(row);
        container.appendChild(this.table);
        container.appendChild(this.refresh_button);
        this.container = container;

        this.interval_handle = window.setInterval(this.update_timer, 1000);
        this.update_timer();
        this.update_players();


    }

    update_timer = () => {
        let now = new Date();
        let t = Math.floor((this.end_time - now) / 1000);
        if (t < 0) {
            t = 0;
        }
        let h = Math.floor(t / 3600);
        let m = Math.floor((t - h * 3600) / 60);
        let s = t - h * 3600 - m * 60;
        this.timer.innerText = (timestampSection(h) + ':' + timestampSection(m) + ':' + timestampSection(s));
    }

    update_table = () => {
        let players = sort_players(this.scoreboard);
        for (let i = this.n; i <= players.length; i++) {
            this.table.appendChild(create_row());
        }
        this.n = players.length;
        let csv_content = "rank,address,twitter,score\n";
        for (let i = 0; i < players.length; i++) {
            let row_str = `${i + 1},`;
            this.table.children[i + 1].children[0].innerHTML = `${i + 1}.`;// rank
            this.table.children[i + 1].children[2].innerHTML = players[i][1];//score
            let name = players[i][0];
            let p_data = df.players.get(name);
            row_str += players[i][0] + ",";
            if (p_data.twitter) {
                row_str += p_data.twitter;
                name = `<a href="https://twitter.com/${p_data.twitter}" >@${p_data.twitter}</a>`;
            }
            row_str += "," + players[i][1] + "\n";
            this.table.children[i + 1].children[1].innerHTML = name;
            csv_content += row_str;
        }
        if (players.length >= 1) {
            this.table.children[1].style.color = 'rgb(255, 68, 183)';
        }
        if (players.length >= 2) {
            this.table.children[2].style.color = 'rgb(248, 183, 62)';
        }
        if (players.length >= 3) {
            this.table.children[3].style.color = 'rgb(193, 60, 255)';
        }
        let last_color = Math.min(players.length, 13);
        for (let i = 4; i <= last_color; i++) {
            this.table.children[i].style.color = 'rgb(107, 104, 255)';
        }
        console.log(csv_content);
        this.csv_content = csv_content;
        if (this.download_button.href) {
            URL.revokeObjectURL(this.download_button.href);
        }
        let blob = new Blob([this.csv_content]);
        this.download_button.href = URL.createObjectURL(blob);
    }

    update_score = (players) => {
        if (!this.table) {
            return;
        }
        for (let player of players) {
            this.scoreboard.set(player.player.toLowerCase(), player.score.toNumber());
        }
        this.update_table();
    }

    update_players = async () => {

        this.refresh_button.innerText = "refreshing...";
        this.refresh_button.disabled = true;

        let player_numbers = await df.contractsAPI.contract.getNPlayers();
        player_numbers = player_numbers.toNumber();
        console.log("players", player_numbers);

        let counter = 0;

        const batch_size = 100;
        for (let i = 0; i < player_numbers; i += batch_size) {
            const end = i + batch_size < player_numbers ? i + batch_size : player_numbers;
            df.contractsAPI.contract.bulkGetPlayers(i, end).then(
                values => {
                    //players.push(...values);
                    //print_score(values);
                    this.update_score(values);
                    counter += values.length;
                    console.log("update score for player", counter);
                    this.refresh_button.innerText = `refreshing...${Math.floor(counter * 100 / player_numbers)}%`;
                    if (counter === player_numbers) {
                        this.refresh_button.innerText = "refresh";
                        this.refresh_button.disabled = false;
                    }
                }
            )
        }
    }


    async render(container) {
        container.style.width = '300px';
        container.appendChild(this.container)
    }

    destroy() {
        this.timer = null;
        this.table = null;
        this.refresh_button = null;
        if (this.interval_handle) {
            window.clearInterval(this.interval_handle);
            this.interval_handle = null;
        }
    }
}

export default Plugin;