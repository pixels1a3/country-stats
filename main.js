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
    const filteredCountries = countries.filter(country => country.region && country.region.value !== 'Aggregates');

    const additionalData = await Promise.all(filteredCountries.map(async (country) => {
        const countryCode = country.id;
        let population, gdp, gdpPPP, gdpPerCapita, gdpPerCapitaPPP;

        try {
            // Fetch population
            const populationResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json`);
            const populationData = await populationResponse.json();
            population = populationData[1] && populationData[1].length > 0 ? populationData[1][0].value : 'N/A';

            // Fetch GDP (nominal)
            const gdpResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`);
            const gdpData = await gdpResponse.json();
            gdp = gdpData[1] && gdpData[1].length > 0 ? gdpData[1][0].value : 'N/A';

            // Fetch GDP (PPP)
            const gdpPPPResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.PP.CD?format=json`);
            const gdpPPPData = await gdpPPPResponse.json();
            gdpPPP = gdpPPPData[1] && gdpPPPData[1].length > 0 ? gdpPPPData[1][0].value : 'N/A';

            // Fetch GDP per Capita
            const gdpPerCapitaResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json`);
            const gdpPerCapitaData = await gdpPerCapitaResponse.json();
            gdpPerCapita = gdpPerCapitaData[1] && gdpPerCapitaData[1].length > 0 ? gdpPerCapitaData[1][0].value : 'N/A';

            // Fetch GDP per Capita PPP
            const gdpPerCapitaPPPResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.PP.CD?format=json`);
            const gdpPerCapitaPPPData = await gdpPerCapitaPPPResponse.json();
            gdpPerCapitaPPP = gdpPerCapitaPPPData[1] && gdpPerCapitaPPPData[1].length > 0 ? gdpPerCapitaPPPData[1][0].value : 'N/A';

        } catch (error) {
            console.error(`Error retrieving additional data for ${countryCode}:`, error);
            population = gdp = gdpPPP = gdpPerCapita = gdpPerCapitaPPP = 'N/A';
        }

        return { ...country, population, gdp, gdpPPP, gdpPerCapita, gdpPerCapitaPPP };
    }));

    displayCountries(additionalData);
}

function displayCountries(countries) {
    const tbody = document.querySelector('#countryTable tbody');
    tbody.innerHTML = '';
    
    countries.forEach(country => {
        const row = document.createElement('tr');

        const countryName = country.name || 'N/A';
        const region = country.region ? country.region.value : 'N/A';
        const population = country.population !== null ? country.population : 'N/A';
        const gdp = country.gdp !== null ? Math.round(country.gdp) : 'N/A';
        const gdpPPP = country.gdpPPP !== null ? Math.round(country.gdpPPP) : 'N/A';
        const gdpPerCapita = country.gdpPerCapita !== null ? Math.round(country.gdpPerCapita) : 'N/A';
        const gdpPerCapitaPPP = country.gdpPerCapitaPPP !== null ? Math.round(country.gdpPerCapitaPPP) : 'N/A';

        row.innerHTML = `
            <td>${countryName}</td>
            <td>${region}</td>
            <td>${population !== 'N/A' ? population.toLocaleString() : 'N/A'}</td>
            <td>${gdp !== 'N/A' ? gdp.toLocaleString() : 'N/A'}</td>
            <td>${gdpPPP !== 'N/A' ? gdpPPP.toLocaleString() : 'N/A'}</td>
            <td>${gdpPerCapita !== 'N/A' ? gdpPerCapita.toLocaleString() : 'N/A'}</td>
            <td>${gdpPerCapitaPPP !== 'N/A' ? gdpPerCapitaPPP.toLocaleString() : 'N/A'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function sortTable(column) {
    const tbody = document.querySelector('#countryTable tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isNumericColumn = (
        column === 'population' || 
        column === 'gdp' || 
        column === 'gdpPPP' || 
        column === 'gdpPerCapita' || 
        column === 'gdpPerCapitaPPP' 
    );

    if (previousColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortOrder = 'asc';
    }
    previousColumn = column;

    rows.sort((a, b) => {
        const aText = a.children[column === 'name' ? 0 :
                          column === 'region' ? 1 :
                          column === 'population' ? 2 :
                          column === 'gdp' ? 3 :
                          column === 'gdpPPP' ? 4 :
                          column === 'gdpPerCapita' ? 5 :
                          column === 'gdpPerCapitaPPP' ? 6 :
                          0].textContent.replace(/,/g, '').replace(/\s/g, '').trim();
        
        const bText = b.children[column === 'name' ? 0 :
                          column === 'region' ? 1 :
                          column === 'population' ? 2 :
                          column === 'gdp' ? 3 :
                          column === 'gdpPPP' ? 4 :
                          column === 'gdpPerCapita' ? 5 :
                          column === 'gdpPerCapitaPPP' ? 6 :
                          0].textContent.replace(/,/g, '').replace(/\s/g, '').trim();

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