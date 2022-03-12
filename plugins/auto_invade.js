/*
    定时脚本
 */
class Plugin {
    constructor() {
        this.interval = 0;
        this.invade_handler = null;
        this.last_run_time = null;
        this.update_info_handler = window.setInterval(this.update_info, 1000);
        let container = document.createElement("div");
        container.style.width = '100%';
        container.style.display = 'block';

        // info1, 显示当前是否在运行, 以及上一次,下一次时间
        let info1 = document.createElement("label");
        info1.placeholder = 'second';
        info1.style.width = '100%';
        info1.style.height = '26px';
        info1.style.textAlign = 'left';
        info1.style.display = 'block';
        info1.innerHTML = "stopped";
        this.info1 = info1;

        // info1, 显示当前是否在运行, 以及上一次,下一次时间
        let last_time_info = document.createElement("label");
        last_time_info.placeholder = 'second';
        last_time_info.style.width = '100%';
        last_time_info.style.height = '26px';
        last_time_info.style.textAlign = 'left';
        last_time_info.style.display = 'block';
        last_time_info.innerHTML = "";
        this.last_time_info = last_time_info;

        // info1, 显示当前是否在运行, 以及上一次,下一次时间
        let next_time_info = document.createElement("label");
        next_time_info.placeholder = 'second';
        next_time_info.style.width = '100%';
        next_time_info.style.height = '26px';
        next_time_info.style.textAlign = 'left';
        next_time_info.style.display = 'block';
        next_time_info.innerHTML = "";
        this.next_time_info = next_time_info;


        //info2, 显示附附加信息
        let info2 = document.createElement("label");
        info2.placeholder = 'second';
        info2.style.width = '100%';
        info2.style.height = '26px';
        info2.style.textAlign = 'left';
        info2.style.display = 'block';
        info2.innerHTML = "stopped";
        this.info2 = info2;

        //info3, 显示附附加信息
        let info3 = document.createElement("label");
        info3.placeholder = 'second';
        info3.style.width = '100%';
        info3.style.height = '26px';
        info3.style.textAlign = 'left';
        info3.style.display = 'block';
        info3.innerHTML = "stopped";
        this.info3 = info3;


        let input = document.createElement('input');
        input.placeholder = 'second';
        input.style.width = '100%';
        input.style.height = '26px';
        input.style.textAlign = 'right';
        input.style.display = 'block';
        this.input = input;

        let start_button = document.createElement('button');
        start_button.innerText = 'start';
        start_button.style.width = '100%';
        start_button.style.height = '26px';
        start_button.style.display = 'block';
        start_button.onclick = this.start;


        let stop_button = document.createElement('button');
        stop_button.innerText = 'stop';
        stop_button.style.width = '100%';
        stop_button.style.height = '26px';
        stop_button.style.display = 'block';
        stop_button.onclick = this.stop;

        let change_button = document.createElement('button');
        change_button.innerText = 'change interval';
        change_button.style.width = '100%';
        change_button.style.height = '26px';
        change_button.style.display = 'block';
        change_button.onclick = this.change_interval;

        container.appendChild(info1);
        container.appendChild(last_time_info);
        container.appendChild(next_time_info);
        container.appendChild(info2);
        container.appendChild(info3);
        container.appendChild(input);
        container.appendChild(start_button);
        container.appendChild(stop_button);
        container.appendChild(change_button);
        this.container = container;
    }

    update_info = () => {
        let now = Date.now();
        if (this.invade_handler) {//invade_handler interval both null or not null ,同时都为null,或者都非null
            this.info1.innerHTML = "running";
        } else {
            this.info1.innerHTML = "stopped";
        }
        if (this.last_run_time) {
            let last_diff = Math.floor((now - this.last_run_time) / 1000);
            this.last_time_info.innerHTML = `previous ${last_diff}s`;
            if (this.interval) {
                let next_diff = Math.ceil((this.interval + this.last_run_time - now) / 1000);// 要向上取,否则有可能是负的
                this.next_time_info.innerHTML = `next ${next_diff}s`;
            } else {

                this.next_time_info.innerHTML = "";
            }
        }
        //this.info2.innerHTML = "testing";
    }
    get_time_interval = () => {
        return parseInt(this.input.value);
    }
    start = async () => {
        if (this.invade_handler) {
            window.clearInterval(this.invade_handler);
            console.log("auto invade stop ");
        }
        console.log("auto invade start ", this.get_time_interval());
        this.interval = this.get_time_interval() * 1000;
        this.invade_handler = window.setInterval(this.period, this.interval);
        await this.period();
        this.update_info();

    }
    stop = () => {
        if (this.invade_handler) {
            window.clearInterval(this.invade_handler);
            console.log("auto invade stop ");
        }
        this.interval = null;
        this.invade_handler = null;
        this.update_info();
    }
    change_interval = async () => {
        if (this.invade_handler) {
            window.clearInterval(this.invade_handler);
            console.log("auto invade stop ");
        }
        console.log("auto invade start ", this.get_time_interval());
        this.interval = this.get_time_interval() * 1000;
        this.invade_handler = window.setInterval(this.period, this.interval);
        await this.period();
        this.update_info();
    }


    period = async () => {
        let CAPTURE_ZONE_PLANET_LEVEL_SCORE = [
            0,
            0,
            250000,
            500000,
            750000,
            1000000,
            10000000,
            20000000,
            50000000,
            100000000
        ];
        let planets = df.getMyPlanets();
        let invader_counter = 0;
        let capture_counter = 0;
        let wait_counter = 0;
        let capture_score = 0;
        let wait_score = 0;
        for (let p of planets) {
            if (p.planetLevel < 2) {
                continue;
            }
            if (p.invader === "0x0000000000000000000000000000000000000000") {
                if (df.captureZoneGenerator.isInZone(p.locationId)) {
                    console.log(`invade ${p.locationId}, level ${p.planetLevel}`);
                    await df.invadePlanet(p.locationId);
                    invader_counter++;
                }
                continue;
            }
            if (p.capturer === "0x0000000000000000000000000000000000000000") {
                if (df.ethConnection.getCurrentBlockNumber() - p.invadeStartBlock > 2048 && p.energy > p.energyCap * 0.8) {
                    console.log(`capture ${p.locationId}, level ${p.planetLevel}`);
                    await df.capturePlanet(p.locationId);
                    capture_counter++;
                    capture_score += CAPTURE_ZONE_PLANET_LEVEL_SCORE[p.planetLevel];
                } else {
                    wait_counter++;
                    wait_score += APTURE_ZONE_PLANET_LEVEL_SCORE[p.planetLevel];
                }
            }
        }
        // console.log(`zone check done, invaded ${invader_counter} planets, capture ${capture_counter} planets`);
        this.info2.innerText = `invaded ${invader_counter}, capture ${capture_counter} ,wait ${wait_counter}`;
        this.info3.innerText = `capture ${capture_score} ,wait ${wait_score}`;
        this.update_info();
        this.last_run_time = Date.now();
    }

    /**
     * Called when plugin is launched with the "run" button.
     */
    async render(container) {
        container.parentElement.style.minHeight = 'unset';
        container.style.minHeight = 'unset';
        container.style.width = '250px';
        container.appendChild(this.container);
    }

    /**
     * Called when plugin modal is closed.
     */
    destroy() {
        if (this.update_info_handler) {
            window.clearInterval(this.update_info_handler);
        }
        this.update_info_handler = null;

        if (this.invade_handler) {
            window.clearInterval(this.invade_handler);
            console.log("auto invade stop ");
        }
        this.invade_handler = null;
    }
}

/**
 * And don't forget to export it!
 */
export default Plugin;