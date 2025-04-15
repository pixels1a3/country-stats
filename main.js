let previousColumn = '';
let sortOrder = 'asc';
let allCountries = [];

async function fetchCountries() {
    const baseUrl = 'http://api.worldbank.org/v2/country?format=json&page=';
    let page = 1;
    let countries = [];

    while (true) {
        try {
            const response = await fetch(baseUrl + page);
            const data = await response.json();
            if (data[1] && data[1].length > 0) {
                countries = countries.concat(data[1]);
                page++;
            } else {
                break;
            }
        } catch (error) {
            console.error('Error retrieving country data:', error);
            break;
        }
    }

    await fetchAdditionalData(countries);
}

async function fetchAdditionalData(countries) {
    const filteredCountries = countries.filter(country => country.region && country.region.value !== 'Aggregates');

    const additionalData = await Promise.all(filteredCountries.map(async (country) => {
        const countryCode = country.id;
        let gdp, gdpPPP, gdpPerCapita, gdpPerCapitaPPP, lifeExpectancy, literacy;

        const currentYear = new Date().getFullYear();
        const dateRange = `${currentYear - 10}:${currentYear}`;

        try {
            const gdpResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&date=${dateRange}`);
            const gdpData = await gdpResponse.json();
            gdp = gdpData[1] && gdpData[1].length > 0 ? gdpData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';

            const gdpPPPResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.PP.CD?format=json&date=${dateRange}`);
            const gdpPPPData = await gdpPPPResponse.json();
            gdpPPP = gdpPPPData[1] && gdpPPPData[1].length > 0 ? gdpPPPData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';

            const gdpPerCapitaResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=${dateRange}`);
            const gdpPerCapitaData = await gdpPerCapitaResponse.json();
            gdpPerCapita = gdpPerCapitaData[1] && gdpPerCapitaData[1].length > 0 ? gdpPerCapitaData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';

            const gdpPerCapitaPPPResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.PP.CD?format=json&date=${dateRange}`);
            const gdpPerCapitaPPPData = await gdpPerCapitaPPPResponse.json();
            gdpPerCapitaPPP = gdpPerCapitaPPPData[1] && gdpPerCapitaPPPData[1].length > 0 ? gdpPerCapitaPPPData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';

            const lifeExpectancyResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/SP.DYN.LE00.IN?format=json&date=${dateRange}`);
            const lifeExpectancyData = await lifeExpectancyResponse.json();
            lifeExpectancy = lifeExpectancyData[1] && lifeExpectancyData[1].length > 0 ? lifeExpectancyData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';

            const literacyResponse = await fetch(`http://api.worldbank.org/v2/country/${countryCode}/indicator/SE.ADT.LITR.ZS?format=json&date=${dateRange}`);
            const literacyData = await literacyResponse.json();
            literacy = literacyData[1] && literacyData[1].length > 0 ? literacyData[1].filter(d => d.value !== null).sort((a, b) => b.date - a.date)[0]?.value ?? 'N/A' : 'N/A';
        } catch (error) {
            console.error(`Error retrieving additional data for ${countryCode}:`, error);
            gdp = gdpPPP = gdpPerCapita = gdpPerCapitaPPP = lifeExpectancy = literacy = 'N/A';
        }

        return { ...country, gdp, gdpPPP, gdpPerCapita, gdpPerCapitaPPP, lifeExpectancy, literacy };
    }));

    allCountries = additionalData;
    displayCountries(allCountries);
}

function displayCountries(countries) {
    const tbody = document.querySelector('#countryTable tbody');
    tbody.innerHTML = '';

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

    const filteredCountries = countries.filter(country =>
        (country.name || 'N/A').toLowerCase().includes(searchTerm)
    );

    const sortedCountries = [...filteredCountries].sort((a, b) => {
        const aName = a.name || 'N/A';
        const bName = b.name || 'N/A';
        return aName.localeCompare(bName);
    });

    sortedCountries.forEach(country => {
        const row = document.createElement('tr');

        const countryName = country.name || 'N/A';
        const region = country.region ? country.region.value : 'N/A';
        const gdp = country.gdp !== null && country.gdp !== undefined && !isNaN(country.gdp) ? Math.round(country.gdp) : 'N/A';
        const gdpPPP = country.gdpPPP !== null && country.gdpPPP !== undefined && !isNaN(country.gdpPPP) ? Math.round(country.gdpPPP) : 'N/A';
        const gdpPerCapita = country.gdpPerCapita !== null && country.gdpPerCapita !== undefined && !isNaN(country.gdpPerCapita) ? Math.round(country.gdpPerCapita) : 'N/A';
        const gdpPerCapitaPPP = country.gdpPerCapitaPPP !== null && country.gdpPerCapitaPPP !== undefined && !isNaN(country.gdpPerCapitaPPP) ? Math.round(country.gdpPerCapitaPPP) : 'N/A';
        const lifeExpectancy = country.lifeExpectancy !== null && country.lifeExpectancy !== undefined && !isNaN(country.lifeExpectancy) ? Number(country.lifeExpectancy) : 'N/A';
        const literacy = country.literacy !== null && country.literacy !== undefined && !isNaN(country.literacy) ? Number(country.literacy) : 'N/A';

        row.innerHTML = `
            <td>${countryName}</td>
            <td>${region}</td>
            <td>${gdp !== 'N/A' ? gdp.toLocaleString() : 'N/A'}</td>
            <td>${gdpPPP !== 'N/A' ? gdpPPP.toLocaleString() : 'N/A'}</td>
            <td>${gdpPerCapita !== 'N/A' ? gdpPerCapita.toLocaleString() : 'N/A'}</td>
            <td>${gdpPerCapitaPPP !== 'N/A' ? gdpPerCapitaPPP.toLocaleString() : 'N/A'}</td>
            <td>${lifeExpectancy !== 'N/A' ? lifeExpectancy.toFixed(2) : 'N/A'}</td>
            <td>${literacy !== 'N/A' ? literacy.toFixed(2) : 'N/A'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function sortTable(column) {
    const tbody = document.querySelector('#countryTable tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const columnIndex = {
        'name': 0,
        'region': 1,
        'gdp': 2,
        'gdpPPP': 3,
        'gdpPerCapita': 4,
        'gdpPerCapitaPPP': 5,
        'lifeExpectancy': 6,
        'literacy': 7
    }[column];

    const isNumericColumn = ['gdp', 'gdpPPP', 'gdpPerCapita', 'gdpPerCapitaPPP', 'lifeExpectancy', 'literacy'].includes(column);

    if (previousColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortOrder = 'asc';
    }
    previousColumn = column;

    rows.sort((a, b) => {
        const aText = a.children[columnIndex].textContent.trim();
        const bText = b.children[columnIndex].textContent.trim();

        if (isNumericColumn) {
            const aValue = aText === 'N/A' ? Number.NEGATIVE_INFINITY : parseFloat(aText.replace(/[\s,]/g, ''));
            const bValue = bText === 'N/A' ? Number.NEGATIVE_INFINITY : parseFloat(bText.replace(/[\s,]/g, ''));
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            return sortOrder === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
        }
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            displayCountries(allCountries);
        });
    }
}

window.onload = () => {
    fetchCountries();
    setupSearch();
};