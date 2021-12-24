import axios from "axios"
import fs from "fs"
import cliProgress from "cli-progress"
import chalk from "chalk"

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

const main = async () => {
  const result = {}

  var { info, tlds} = await axios.get("https://data.iana.org/TLD/tlds-alpha-by-domain.txt").then((res) => {
    const data = res.data.split("\n")
    const header = data.shift().split(" ")
    const info = {
      version: header[2].slice(0, -1)
    }

    const tlds = data
    
    return { info, tlds }
  })

  progress.start(tlds.length, 0)

  for (const tld of tlds) {
    try {
      const url = `http://${tld.toLowerCase()}/`
      await axios({url, timeout: 3000}).then((res) => {
        result[tld] = {
          tld, 
          url: url, 
          status: res.status 
        }

        progress.increment()
      })
    } catch (err) {
      // if (err.code === "ECONNABORTED") {
      //   result[tld] = {
      //     tld, 
      //     status: 408 
      //   }
      // }

      progress.increment()
    }
  }

  progress.stop()

  fs.writeFileSync(`result-v${info.version}.json`, JSON.stringify(result, null, 2))

  console.log(`Success. Output saved to ${chalk.green(`result-v${info.version}.json`)}`)
}

main()