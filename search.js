const coinsList = document.getElementById('coins-list')
const exchangesList = document.getElementById('exchanges-list')
const nftsList = document.getElementById('nfts-list')

document.addEventListener('DOMContentLoaded', () => {
    //get the url parameter after the search
    const params = new URLSearchParams(window.location.search)
    const query = params.get('query')
    if (query) { //fetch the search result and pass the query and list
        fetchSearchResult(query, [coinsList, exchangesList, nftsList])
    } else { //if no query then show the message.
        const searchHeading = document.getElementById('searchHeading')
        const searchContainer = document.querySelector('.search-container')
        searchContainer.innerHTML = `<p style="color: red; text-align: center; margin-bottom: 8px">Nothing To Show...</p>`
        searchHeading.innerText = 'Please search something...'
    }
})

// showing the search result based on the query 
const fetchSearchResult = (param, idsToToggle) => {
    const searchHeading = document.getElementById('searchHeading')

    idsToToggle.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`)
        //hide the error message and show the spinner
        if (errorElement) {
            errorElement.style.display = 'none'
        }
        toggleSpinner(id, `${id}-spinner`, true)
    });

    coinsList.innerHTML = ''
    exchangesList.innerHTML = ''
    nftsList.innerHTML = ''

    searchHeading.innerText = `Search results for "${param}"`

    //fetch the result of search api
    const url = `https://api.coingecko.com/api/v3/search?query=${param}`
    const options = { method: 'GET', headers: { accept: 'application/json' } }

    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network is not responding' + response.statusText)
            }
            idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false))
            return response.json()
        })
        .then(data => { //filter result with only image are displayed
            let coins = (data.coins || []).filter(coin => coin.thumb !== "missing_thumb.png")
            let exchanges = (data.exchanges || []).filter(exchange => exchange.thumb !== "missing_thumb.png")
            let nfts = (data.nfts || []).filter(nft => nft.thumb !== "missing_thumb.png")

            //shows equal result in each result
            const coinsCount = coins.length
            const exchangesCount = exchanges.length
            const nftsCount = nfts.length

            //find the minimum count of result between them
            let minCount = Math.min(coinsCount, exchangesCount, nftsCount)

            //show equal numbers from each category
            if (coinsCount > 0 && exchangesCount > 0 && nftsCount > 0) {
                coins = coins.slice(0, minCount)
                exchanges = exchanges.slice(0, minCount)
                nfts = nfts.slice(0, minCount)
            }

            //display th result
            coinsResult(coins)
            exchangesResult(exchanges)
            nftsResult(nfts)

            //if nothing is found display the no result message
            if (coins.length === 0) {
                coinsList.innerHTML = '<p style="color: red; text-align: center;">No result found for coins.</p>'
            }
            if (exchanges.length === 0) {
                exchangesList.innerHTML = '<p style="color: red; text-align: center;">No result found for exchanges.</p>'
            }
            if (nfts.length === 0) {
                nftsList.innerHTML = '<p style="color: red; text-align: center;">No result found for nfts.</p>'
            }
        })
        //if catch any error show the error message
        .catch(error => {
            idsToToggle.forEach(id => {
                toggleSpinner(id, `${id}-spinner`, false)
                document.getElementById(`${id}-error`).style.display = 'block'
            });
            console.error('Error fetching data:', error)
        })
}

//list the coins
const coinsResult = (coins) => {
    coinsList.innerHTML = '' //clear the current coin list

    const table = createTable(['Rank', 'Coin']) //create the table with 2 column

    //create row for each coin
    coins.forEach(coin => {
        const row = document.createElement('tr')
        row.innerHTML = `
                <td>${coin.market_cap_rank}</td>
                <td class="name-column"><img src="${coin.thumb}" alt="">${coin.name} <span>(${coin.symbol.toUpperCase()})</span></td>
        `
        table.appendChild(row)
        row.onclick = () => {
            window.location.href = `./coin.html?coin=${coin.id}`
        }
    })
    coinsList.appendChild(table)
}

//list the exchange list
const exchangesResult = (exchanges) => {
    exchangesList.innerHTML = ''

    const table = createTable(['Exchange', 'Market'])

    exchanges.forEach(exchange => {
        const row = document.createElement('tr')
        row.innerHTML = `
                <td class="name-column"><img src="${exchange.thumb}">${exchange.name}</td>
                <td>${exchange.market_type}</td>
        `
        table.appendChild(row)
    })
    exchangesList.appendChild(table)
}

//list the nfts list
const nftsResult = (nfts) => {
    nftsList.innerHTML = ''

    const table = createTable(['NFT', 'Symbol'])

    nfts.forEach(nft => {
        const row = document.createElement('tr')
        row.innerHTML = `
                <td class="name-column"><img src="${nft.thumb}" alt="">${nft.name}</td>
                <td>${nft.symbol}</td>
        `
        table.appendChild(row)
    })
    nftsList.appendChild(table)
}