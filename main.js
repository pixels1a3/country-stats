function fetchCountries() {
    var countries = []
    var page = 1

    function fetchPage() {
        var url = `http://api.worldbank.org/v2/country?format=json&page=` + page;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data[1].length > 0) {
                    
                }
            })
    }
}







const url = `http://api.worldbank.org/v2/country?format=json&${page}`
fetch(url)
    .then(response => response.json())
    .then(data => {
        const countryOptions = document.getElementById('country-options')
        const countries = data[1].map(country => country.name)
        countries.forEach(country => {
            const option = document.createElement('a')
            option.href = '#'
            option.textContent = country
            option.onclick = () => selectedCountry(country)
            countryOptions.appendChild(option)
        })
    })
    .catch(error => console.error('Error:', error))

    function selectedCountry(country) {
        alert('You selected: ' + country)
    }

/* start
there is a bar
when you click on the bar there'll be a dropdown containing all countries
when clicking on a country, the following info will appear:
    -population
    -gdp
    -gdp per capita
    -homicide rate
*/