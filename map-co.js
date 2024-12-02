// Nous allons faire une app de type Geoguesser 
// On utilisera Leaflet pour afficher la carte 

// Affichage de la carte 
let map = L.map('map').setView([51.505, -0.09], 2);
// On affiche le layer pour la carte
// add Stamen Watercolor to map.
let layer = L.tileLayer.provider('CartoDB.VoyagerNoLabels').addTo(map);

window.addEventListener('DOMContentLoaded', () => {
    // On récupère une ville aléatoire depuis l'API REST countries
    fetch('https://restcountries.com/v3.1/all')
    .then(res => res.json())
    .then(data => {

        let countries = []

        data.forEach((country) => {
            if (country.population > 100000) {
                countries.push(country)
            }
        })

        // On initialise le score
        let score = 0

        // On appelle notre fonction pour générer un tour 
        newRound(countries, score)
    })
    .catch(err => console.log(err))
})


// Calcul de la distance avec la formule de Haversine
function calculateDistance(coords, city) {
    // Rayon terrestre
    const R = 6371

    // On convertit les degrés en radian
    const lat1 = coords.lat * Math.PI / 180;
    const lat2 = city.lat * Math.PI / 180;
    const lon1 = coords.lng * Math.PI / 180;
    const lon2 = city.lng * Math.PI / 180;

    // On calcule la distance entre les deux points
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    // Formule de Haversine
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
  
    return distance;
}

function newRound(countries, score) {
    let randomIndex = Math.floor(Math.random() * countries.length)
    let randomCountry = countries[randomIndex].name.common
    let randomCity = countries[randomIndex].capital

    console.log(countries[randomIndex])

    let cityCoords = {
        lat : countries[randomIndex].latlng[0],
        lng : countries[randomIndex].latlng[1]
    }

    // On affiche la zone avec le pays et la ville
    const guessArea = document.createElement('div')
    guessArea.classList.add('guess')

    guessArea.innerHTML = `
        <h2 class="country">${randomCountry}</h2>
        <h2 class="city">${randomCity}</h2>
        <h2 class="distance">...</h2>
        <h2 class="score">Score total : ${score}</h2>
    `

    document.querySelector('body').appendChild(guessArea)

    // On écoute la carte pour aficher un marker
    map.addEventListener('click', (e) => {
        const coords = {
            lat : e.latlng.lat,
            lng : e.latlng.lng
        }

        let marker = L.marker([coords.lat, coords.lng]).addTo(map);

        // On vient calculer la distance entre notre Marker et la ville Random
        let distance = Math.floor(calculateDistance(coords, cityCoords)) 

        // On vient afficher le marker de la ville avec un peu de latence
        setTimeout(() => {
            // Affichage du Marker de la ville 
            let cityMarker = L.marker([cityCoords.lat, cityCoords.lng]).addTo(map)
            cityMarker.getElement().classList.add('active')

            // Affichage de la distance entre notre Marker et la réponse
            document.querySelector('.distance').textContent = distance + " km"

            // Afficher popup de résultat ainsi qu'un bouton next
            const popup = document.createElement('div')
            popup.classList.add('result')

            let message = ""

            switch(true) {
                case (distance < 50) :
                    message = "<h2 style='color: green'>Très proche, bravo !</h2>"
                    break
                case (distance < 150) : 
                    message = "<h2 style='color: goldenrod'>On se rapproche !</h2>"
                    break
                case (distance < 500) : 
                    message = "<h2 style='color: orange'>Ca commence à faire cher le TGV</h2>"
                    break
                default :
                    message = "<h2 style='color: darkred'>Trop loin ...</h2>"
            }    
            
            popup.innerHTML = message

            score += distance

            const next = document.createElement('button')
            next.textContent = "Next"
            next.classList.add('next')

            next.addEventListener('click', () => {
                newRound(countries, score)
                popup.remove()
                guessArea.innerHTML = ''
                cityMarker.remove()
                marker.remove()
            })

            popup.appendChild(next)

            document.querySelector('body').appendChild(popup)
            popup.classList.add('animate', 'animate__bounceIn')

        }, 800)
    })
} 



