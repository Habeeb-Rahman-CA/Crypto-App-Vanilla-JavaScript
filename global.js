const coinsCount = document.getElementById('coins-count')
const exchangeCount = document.getElementById('exchanges-count')
const marketCap = document.getElementById('marketCap')
const marketCapChangeElement = document.getElementById('marketCapChange')
const volume = document.getElementById('volume')
const dominance = document.getElementById('dominance')

//when the HTML content fully loaded then fetch the data
document.addEventListener("DOMContentLoaded", () =>{
    fetchGlobal();
})

//Read the data from localstorage
const getLocalStorageData = (key) =>{
    const storedData = localStorage.getItem(key)
    if(!storedData) return null //null if there is no data

    const parsedData = JSON.parse(storedData)
    const currentTime = Date.now()

    //if the data is older than 5min the data remove and fetch again
    if(currentTime - parsedData.timestamp > 300000){
        localStorage.removeItem(key)
        return null
    }
    return parsedData.data
}

//store the data in local storage with a timestamp
const setLocalStorageData = (key, data) =>{
    const storedData = {
        timestamp: Date.now(),
        data: data
    }
    localStorage.setItem(key, JSON.stringify(storedData)) //save the data in local storage
}

//fetch the global cryptocurrency data from "CoinGecko API"
const fetchGlobal = () =>{
    const localStorageKey = 'Global_Data' //define the key
    const localData = getLocalStorageData(localStorageKey)

    //if data is found display it, if not fetch new data
    if (localData){
        displayGlobalData(localData)
    } else {
        const options = {method: 'GET', headers: {accept: 'application/json'}};

        fetch('https://api.coingecko.com/api/v3/global', options)
            .then(response => response.json())
            .then(data => {
                const globalData = data.data //extract the data from API response
                displayGlobalData(globalData)
                setLocalStorageData(localStorageKey, globalData) //and save to local storage
            })
            .catch(error =>{ //if any error show not available
                coinsCount.textContent = 'N/A'
                exchangeCount.textContent = 'N/A'
                marketCap.textContent = 'N/A'
                marketCapChangeElement.textContent = 'N/A'
                volume.textContent = 'N/A'
                dominance.textContent = 'BTC N/A% - ETH N/A%'
                console.error(error)
            })
    }
}

//display the data in the HTML element
const displayGlobalData = (globalData) =>{
    console.log(globalData)

    //coin and exchange count
    coinsCount.textContent = globalData.active_cryptocurrencies || "N/A"
    exchangeCount.textContent = globalData.markets || "N/A"

    //market cap and its change in % if its above 0 then green and below red
    marketCap.textContent = globalData.total_market_cap?.usd ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T` : "N/A"
    const marketCapChange = globalData.market_cap_change_percentage_24h_usd

    if(marketCapChange !== undefined){
        const changeText = `${marketCapChange.toFixed(1)}%` // "toFixed" used to fix decimal place here it shows only 1 decimal place
        marketCapChangeElement.innerHTML = `${changeText} <i class="${marketCapChange < 0 ? 'red' : 'green'} ri-arrow-${marketCapChange < 0 ? 'down' : 'up'}-s-fill"></i>`
        marketCapChangeElement.style.color = marketCapChange < 0 ? 'red' : 'green'
    } else {
        marketCapChangeElement.textContent = "N/A"
    }
    // "total_volume?usd" this means if there is total volume exist then access to the usd from total volume.
    volume.textContent = globalData.total_volume?.usd ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B` : 'N/A'

    //adding BTC and ETH dominance
    const btcDominance = globalData.market_cap_percentage?.btc ? `${globalData.market_cap_percentage.btc.toFixed(1)}%` : 'N/A'
    const ethDominance = globalData.market_cap_percentage?.eth ? `${globalData.market_cap_percentage.eth.toFixed(1)}%` : 'N/A'

    dominance.textContent = `BTC ${btcDominance} - ETH ${ethDominance}`
}

//function to toggle the list and spinner based on show
const toggleSpinner = (listId, spinnerId, show) => {
    const listElement = document.getElementById(listId)
    const spinnerElement = document.getElementById(spinnerId)

    if (spinnerElement) {
        spinnerElement.style.display = show ? 'block' : 'none'
    }
    if (listElement) {
        listElement.style.display = show ? 'none' : 'block'
    }
}