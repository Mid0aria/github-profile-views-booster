const packageJson = require("./package.json");
const cp = require("child_process");

for (let dep of Object.keys(packageJson.dependencies)) {
    try {
        require.resolve(dep);
    } catch (err) {
        console.log("Installing dependencies...");
        cp.execSync(`npm i`);
    }
}
const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const chalk = require("chalk");

let config;
try {
    config = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch (err) {
    console.error("Error reading config file:", err);
    process.exit(1);
}

const updateLine = (newLine) => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(newLine);
};

const run = async () => {
    let count = 0;

    while (true) {
        let url = config.counter_url;
        try {
            let response;
            if (
                config.use_proxy === "y" ||
                config.use_proxy === "yes" ||
                config.use_proxy === "true"
            ) {
                const proxies = fs
                    .readFileSync("proxies.txt", "utf8")
                    .split("\n");
                const proxy =
                    proxies[Math.floor(Math.random() * proxies.length)].trim();

                const proxyUrl = `http://${proxy}`;
                const proxyAgent = axios.create({
                    proxy: { host: proxyUrl, port: 80 },
                });

                response = await proxyAgent.get(url, { timeout: 10000 });
            } else {
                response = await axios.get(url, { timeout: 10000 });
            }

            if (response.status === 200) {
                count++;
                updateLine(
                    `${chalk.green(
                        "[+] "
                    )}Successful request! Total sended views: ${chalk.yellow(
                        count
                    )}`
                );
            } else {
                updateLine(`${chalk.red("[-] ")}Error request.`);
            }
        } catch (error) {
            updateLine(
                `${chalk.red("[-] ")}Error making request: ${error.message}`
            );
        }
    }
};

run();
