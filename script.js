// to track data is loaded or not
const tabDataLoaded = {
    tab1: false,
    tab2: false,
    tab3: false,
    tab4: false,
}

//to open the tab and load the data if it is not loaded yet
const openTab = (event, tabName) => {
    const tabContent = document.querySelectorAll(".tab-content")
    const tabButtons = document.querySelectorAll(".tab-button")

    //hide all tab and remove the active class
    tabContent.forEach(content => content.style.display = "none")
    tabButtons.forEach(button => button.classList.remove("active"))

    //display the content of selected tab and add 'active' class
    document.getElementById(tabName).style.display = "block"
    event.currentTarget.classList.add("active")

    //check the data loaded or not, if not fetch it.
    if (!tabDataLoaded[tabName]) {
        switch (tabName) {
            case 'tab1': fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true', ['asset-list'], displayAssets, tabName, 'Crypto_Data')
                break;
            case 'tab2': fetchAndDisplay('https://api.coingecko.com/api/v3/exchanges', ['exchange-list'], displayExchanges, tabName, 'Exchanges_Data')
                break;
            case 'tab3': fetchAndDisplay('https://api.coingecko.com/api/v3/coins/categories', ['category-list'], displayCategories, tabName, 'Categories_Data')
                break
            case 'tab4': fetchAndDisplay('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', ['company-list'], displayCompanies, tabName, 'Companies_Data')
        }
    }
}

//run when the page finished loading it will fetch data
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.tab-button').click(); // to open the 1st tab
    fetchData()
})

//fetch the data of trending and asset list
async function fetchData() {
    await Promise.all([
        fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending', ['coins-list', 'nfts-list'], displayTrend, null, 'Trending_Data'),
        fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true', ['asset-list'], displayAssets, null, 'Crypto_Data')
    ])
}

//fetch and display from the API
async function fetchAndDisplay(url, idsToToggle, displayFunction, tabName = null, localKey) {
    idsToToggle.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`)

        if (errorElement) { //to hide error message and show spinner
            errorElement.style.display = "none"
        }
        toggleSpinner(id, `${id}-spinner`, true)
    })

    //get the data from the local storage
    const localstorageKey = localKey
    const localData = getLocalStorageData(localstorageKey)

    //if data is found hide the spinner and show the data
    if (localData) {
        idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false))
        displayFunction(localData)
    }
    try { //fetch API if the data is not at local storage
        const response = await fetch(url)
        if (!response.ok) throw new Error('API limit reached') //throw an error if reponse is not 'ok'
        const data = await response.json()
        console.log('API Response:', data)
        //hide the spinner and show the data
        idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false))
        displayFunction(data)
        setLocalStorageData(localstorageKey, data) //and save to the local storage
        if (tabName) {
            tabDataLoaded[tabName] = true
        }
    } catch (error) { //if there is an error, hide the spinner and show the error message
        if(localData){
            displayFunction(localData) //use local data on error
        }
        idsToToggle.forEach(id => {
            toggleSpinner(id, `${id}-spinner`, false)
            document.getElementById(`${id}-error`).style.display = 'block'
        })
        if (tabName) {
            tabDataLoaded[tabName] = false //mark the data is not loaded
        }
    }
}

//display trending data(coins and nfts)
const displayTrend = (data) => {
    displayTrendCoins(data.coins.slice(0, 5)) //only top 5
    displayTrendNfts(data.nfts.slice(0, 5))
}
//display trending coins
const displayTrendCoins = (coins) => {
    const coinsList = document.getElementById('coins-list')
    coinsList.innerHTML = '' //clear the current data
    const table = createTable(['Coin', 'Price', 'Market Cap', 'Volume', '24h%'])

    coins.forEach(coin => {
        const coinData = coin.item
        const row = document.createElement('tr')
        //insert the html into the table row
        row.innerHTML = `
        <td class="name-column table-fixed-column"><img src="${coinData.thumb}"> ${coinData.name} <span>(${coinData.symbol.toUpperCase()})</span></td>
        <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
        <td>${coinData.data.market_cap}</td>
        <td>${coinData.data.total_volume}</td>
        <td class="${coinData.data.price_change_percentage_24h.usd >= 0 ? 'green' : 'red'}">${coinData.data.price_change_percentage_24h.usd.toFixed(2)}%</td>
        `
        row.onclick = () => window.location.href = `./coin.html?coin=${coinData.id}` //when click the row it will open the coin.html
        table.appendChild(row)
    });
    coinsList.appendChild(table)
}

//display trending nfts
const displayTrendNfts = (nfts) => {
    const nftsList = document.getElementById('nfts-list')
    nftsList.innerHTML = '' //clear the current data
    const table = createTable(['NFT', 'Market', 'Price', '24h Vol', '24h%'])

    nfts.forEach(nft => {
        const row = document.createElement('tr')
        //insert the html into the table row
        row.innerHTML = `
        <td class="name-column table-fixed-column"><img src="${nft.thumb}"> ${nft.name} <span>(${nft.symbol.toUpperCase()})</span></td>
        <td>${nft.native_currency_symbol.toUpperCase()}</td>
        <td>${nft.data.floor_price}</td>
        <td>${nft.data.h24_volume}</td>
        <td class="${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0 ? 'green' : 'red'}">${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change).toFixed(2)}%</td>
        `
        table.appendChild(row)
    });
    nftsList.appendChild(table)
}

//display assets
const displayAssets = (data) => {
    const cryptoList = document.getElementById('asset-list')
    cryptoList.innerHTML = ''
    const table = createTable(['Rank', 'Coin', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'], 1)

    const sparklineData = []

    data.forEach(asset => {
        const row = document.createElement('tr')
        //insert the html into the table row
        row.innerHTML = `
                        <td class="rank">${asset.market_cap_rank}</td>
                        <td class="name-column table-fixed-column"><img src="${asset.image}">${asset.name}<span>(${asset.symbol.toUpperCase()})</span></td>
                        <td>$${asset.current_price.toFixed(2)}</td>
                        <td class="${asset.price_change_percentage_24h >= 0 ? "green" : "red"}">$${asset.price_change_24h.toFixed(2)}</td>
                        <td class="${asset.price_change_percentage_24h >= 0 ? "green" : "red"}">${asset.price_change_percentage_24h.toFixed(2)}%</td>
                        <td>$${asset.total_volume.toLocaleString()}</td>
                        <td>$${asset.market_cap.toLocaleString()}</td>
                        <td><canvas id="chart-${asset.id}" width="100" height="50"></canvas></td>
        `
        table.appendChild(row)
        //pushing the sparkline data into the row
        sparklineData.push({
            id: asset.id,
            sparkline: asset.sparkline_in_7d.price,
            color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1] ? 'green' : 'red'
        })
        row.onclick = () => window.location.href = `./coin.html?coin=${asset.id}`
    });
    cryptoList.appendChild(table)

    //settig up the sparkline chart
    sparklineData.forEach(({ id, sparkline, color }) => {
        const ctx = document.getElementById(`chart-${id}`).getContext('2d')
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sparkline.map((_, index) => index),
                datasets: [{
                    data: sparkline,
                    borderColor: color,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        })
    })
}

//displaying the exchanges
const displayExchanges = (data) =>{
    const exchangeList = document.getElementById('exchange-list')
    exchangeList.innerHTML = '' //clear the current data
    const table = createTable(['Rank', 'Exchange', 'Trust Score', '24hr Trade', '24hr Trade (Normal)', 'Country', 'Website', 'Year'])

    data = data.slice(0, 20) //only show the first 20

    data.forEach(exchange => {
        const row = document.createElement('tr')
        //insert the html into the table row
        row.innerHTML = `
                    <td class="rank">${exchange.trust_score_rank}</td>
                    <td class="name-column table-fixed-column"><img src="${exchange.image}">${exchange.name}</td>
                    <td>${exchange.trust_score}</td>
                    <td>$${exchange.trade_volume_24h_btc.toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3} )} (BTC)</td>
                    <td>$${exchange.trade_volume_24h_btc_normalized.toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3} )} (BTC)</td>
                    <td class="name-column">${exchange.country || 'N/A'}</td>
                    <td class="name-column">${exchange.url}</td>
                    <td>${exchange.year_established || 'N/A'}</td>
        `
        table.appendChild(row)
    });
    exchangeList.appendChild(table)
}