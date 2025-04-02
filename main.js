let previousColumn = '';
let sortOrder = 'asc';

async function fetchCountries() {
    const baseUrl = 'http://api.worldbank.org/v2/country?format=json&page=';
    let page = 1;
    let countries = [];

    while (true) {
        try {
            const response = await fetch(baseUrl + page);
            const data = await response.json();
            if (data[1] && data[1].length > 0) {
                countries = countries.concat(data[1]); // Add countries
                page++; // Increase page number
            } else {
                break;
            }
        } catch (error) {
            console.error('Error retrieving country data:', error);
            break;
        }
    }

    // Fetch additional data for population etc.
    await fetchAdditionalData(countries);
}

async function fetchAdditionalData(countries) {
    const additionalData = await Promise.all(countries.map(async (country) => {
        const countryCode = country.id;
        let population, gdp, gdpPerCapita;

        try {
            // Fetch population
            const populationResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json`);
            const populationData = await populationResponse.json();
            population = populationData[1] && populationData[1].length > 0 ? populationData[1][0].value : 'N/A';

            // Fetch GDP
            const gdpResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`);
            const gdpData = await gdpResponse.json();
            gdp = gdpData[1] && gdpData[1].length > 0 ? gdpData[1][0].value : 'N/A';

            // Fetch GDP per Capita
            const gdpPerCapitaResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json`);
            const gdpPerCapitaData = await gdpPerCapitaResponse.json();
            gdpPerCapita = gdpPerCapitaData[1] && gdpPerCapitaData[1].length > 0 ? gdpPerCapitaData[1][0].value : 'N/A';

        } catch (error) {
            console.error(`Error retrieving additional data for ${countryCode}:`, error);
            population = gdp = gdpPerCapita = 'N/A';
        }

        return { ...country, population, gdp, gdpPerCapita };
    }));

    displayCountries(additionalData);
}

function displayCountries(countries) {
    const tbody = document.querySelector('#countryTable tbody');
    tbody.innerHTML = '';
    countries.forEach(country => {
        const row = document.createElement('tr');

        const countryName = country.name || 'N/A';
        const countryCode = country.id || 'N/A';
        const region = country.region ? country.region.value : 'N/A';
        const population = country.population !== null ? country.population : 'N/A';
        const gdp = country.gdp !== null ? Math.round(country.gdp) : 'N/A';
        const gdpPerCapita = country.gdpPerCapita !== null ? Math.round(country.gdpPerCapita) : 'N/A';

        row.innerHTML = `
            <td>${countryName}</td>
            <td>${countryCode}</td>
            <td>${region}</td>
            <td>${population !== 'N/A' ? population.toLocaleString() : 'N/A'}</td>
            <td>${gdp !== 'N/A' ? gdp.toLocaleString() : 'N/A'}</td>
            <td>${gdpPerCapita !== 'N/A' ? gdpPerCapita.toLocaleString() : 'N/A'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function sortTable(column) {
    const tbody = document.querySelector('#countryTable tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isNumericColumn = (column === 'population' || column === 'gdp' || column === 'gdpPerCapita');

    if (previousColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortOrder = 'asc';
    }
    previousColumn = column;

    rows.sort((a, b) => {
        const aText = a.children[column === 'name' ? 0 : column === 'code' ? 1 : column === 'region' ? 2 : column === 'population' ? 3 : column === 'gdp' ? 4 : 5].textContent.replace(/,/g, '').replace(/\s/g, '').trim();
        const bText = b.children[column === 'name' ? 0 : column === 'code' ? 1 : column === 'region' ? 2 : column === 'population' ? 3 : column === 'gdp' ? 4 : 5].textContent.replace(/,/g, '').replace(/\s/g, '').trim();

        if (isNumericColumn) {
            const aNum = aText === 'N/A' ? 0 : Math.round(parseFloat(aText));
            const bNum = bText === 'N/A' ? 0 : Math.round(parseFloat(bText));
            return aNum - bNum;
        } else {
            return aText.localeCompare(bText);
        }
    });

    if (sortOrder === 'desc') {
        rows.reverse();
    }

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

window.onload = fetchCountries;