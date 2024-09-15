const tabDataLoaded = {
    tab1: false,
    tab2: false,
    tab3: false,
    tab4: false,
}

const openTab = (event, tabName) => {
    const tabContent = document.querySelectorAll(".tab-content")
    const tabButtons = document.querySelectorAll(".tab-button")

    tabContent.forEach(content => content.style.display = "none")
    tabButtons.forEach(button => button.classList.remove("active"))

    document.getElementById(tabName).style.display = "block"
    event.currentTarget.classList.add("active")

    if (!tabDataLoaded[tabName]) {
        switch (tabName) {
            case 'tab1': fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true', ['asset-list'], displayAssets, 'Crypto_Data')
                break;
            case 'tab2': fetchAndDisplay('https://api.coingecko.com/api/v3/exchanges', ['exchange-list'], displayExchanges, tabName, 'Exchanges_Data')
                break;
            case 'tab3': fetchAndDisplay('https://api.coingecko.com/api/v3/coins/categories', ['category-list'], displayCategories, tabName, 'Categories_Data')
                break
            case 'tab4': fetchAndDisplay('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', ['company-list'], displayCompanies, tabName, 'Companies_Data')
        }
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    document.querySelector('.tab-button').click();
    fetchData()
})

async function fetchData() {
    await Promise.all([fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending')])
}