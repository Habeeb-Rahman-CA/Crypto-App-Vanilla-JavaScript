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
        fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending', ['coins-list', 'nfts-list'], displayTrending, null, 'Trending_Data'),
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

        //mark tab is loaded
        if (tabName) {
            tabDataLoaded[tabName] = true
        } else {
            try { //fetch API if the data is not at local storage
                const response = await fetch(url)
                if (!response.ok) throw new Error('API limit reached') //throw an error if reponse is not 'ok'
                const data = await response.json()
                //hide the spinner and show the data
                idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false))
                displayFunction(data)
                setLocalStorageData(localstorageKey, data) //and save to the local storage
                if (tabName) {
                    tabDataLoaded[tabName] = true
                }
            } catch (error) { //if there is an error, hide the spinner and show the error message
                idsToToggle.forEach(id => {
                    toggleSpinner(id, `${id}-spinner`, false)
                    document.getElementById(`${id}-error`).style.display = 'block'
                })
                if (tabName) {
                    tabDataLoaded[tabName] = false //mark the data is not loaded
                }
            }
        }
    }
}