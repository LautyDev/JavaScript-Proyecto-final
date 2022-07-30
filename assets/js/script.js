const info = document.getElementById('viewMap')

const ip = document.getElementById('ip')


// Modal de advertencia

const modalWarn = new bootstrap.Modal(document.getElementById('modalWarn'))
modalWarn.show()

const buttonApprove = document.getElementById('buttonApprove')
buttonApprove.addEventListener('click', approveExecute)


// Ubicación de la IP del visitante

function approveExecute() {
    currentIPInfo()

    async function currentIPInfo() {
        const infoIP = await fetch('https://ipapi.lauty.dev/current').then((res) => res.json()).catch((err) => console.log('Solicitud fallida', err))

        if (!infoIP || infoIP.status === 'fail') return (info.innerHTML = 
            `<div id="viewMap">
                <h2>Error al consultar la dirección IP</h2>
            </div>`)
        
        var DateTime = luxon.DateTime

        const time = DateTime.now().setZone(infoIP.timezone || 'UTC')

        const divMap = 
            `<div id="viewMap">
                <div id="map">

                </div>
                <div id="infoDiv">
                    <button type="button" data-bs-toggle="offcanvas" data-bs-target="#infoOffcanvas" aria-controls="infoOffcanvas">Ver todos los datos de la dirección IP</button>

                    <div class="offcanvas offcanvas-end" tabindex="-1" id="infoOffcanvas" aria-labelledby="infoOffcanvasLabel">
                        <div class="offcanvas-header">
                            <h5 id="infoOffcanvasLabel">Información completa sobre la dirección IP</h5>
                            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <article id="containerInfo">
                                <h5><strong>IP:</strong> ${infoIP.query || 'Sin datos'}</h5>
                                <h5><strong>AS:</strong> ${infoIP.as || 'Sin datos'}</h5>
                                <h5><strong>Nombre AS:</strong> ${infoIP.asname || 'Sin datos'}</h5>
                                <h5><strong>País:</strong> ${infoIP.country || 'Sin datos'} (${infoIP.countryCode || 'Sin datos'})</h5>
                                <h5><strong>Continente:</strong> ${infoIP.continent || 'Sin datos'} (${infoIP.continentCode || 'Sin datos'})</h5>
                                <h5><strong>Región:</strong> ${infoIP.regionName || 'Sin datos'} (${infoIP.region || 'Sin datos'})</h5>
                                <h5><strong>Ciudad:</strong> ${infoIP.city || 'Sin datos'}</h5>
                                <h5><strong>Código postal:</strong> ${infoIP.zip || 'Sin datos'}</h5>
                                <h5><strong>Latitud:</strong> ${infoIP.lat || 'Sin datos'}</h5>
                                <h5><strong>Longitud:</strong> ${infoIP.lon || 'Sin datos'}</h5>
                                <h5><strong>Zona horaria:</strong> ${infoIP.timezone || 'Sin datos'} (${time.toLocaleString(DateTime.TIME_24_SIMPLE)})</h5>
                                <h5><strong>Moneda:</strong> ${infoIP.currency || 'Sin datos'}</h5>
                                <h5><strong>Proveedor:</strong> ${infoIP.org || 'Sin datos'}</h5>
                            </article>
                            <article id="containerInfo">
                                <button type="button" data-bs-toggle="modal" data-bs-target="#sendModal">Enviar por WhatsApp</button>
                
                                <div class="modal fade" id="sendModal" tabindex="-1" aria-labelledby="sendModalLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="sendModalLabel">Enviar todos los datos</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" id="sendForm">
                                                    <input type="number" name="number" id="sendInput" placeholder="Escribe el número de teléfono (ej: 54911XXXXXXX)" required>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" data-bs-dismiss="modal">Cancelar</button>
                                                <button type="button" id="sendButton">Enviar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>  
            </div>`

        info.innerHTML = divMap

        mapboxgl.accessToken = 'pk.eyJ1IjoibGF1dHlkZXYiLCJhIjoiY2w1Y3htOHJ5MGVpbjNibjN3MGQxbjV0NSJ9.vgg471uOM8q8EM9vpX3CgQ'

        const geojson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [infoIP.lon, infoIP.lat],
                    },
                    properties: {
                        title: 'Ubicación',
                        description: 'Ubicación de la dirección IP',
                    },
                },
            ],
        }

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [infoIP.lon, infoIP.lat],
            zoom: 13,
            projection: 'globe',
        })

        for (const feature of geojson.features) {
            const markerDiv = document.createElement('div')
            markerDiv.className = 'marker'

            new mapboxgl.Marker(markerDiv)
                .setLngLat(feature.geometry.coordinates)
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(
                        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                    )
                )
                .addTo(map)
        }


        // Enviar datos

        const sendForm = document.getElementById('sendForm')
        const sendButton = document.getElementById('sendButton')

        sendForm.addEventListener('submit', sendIPInfo)
        sendButton.addEventListener('click', sendIPInfo)

        async function sendIPInfo(e) {
            e.preventDefault()

            const sendInput = document.getElementById('sendInput')

            if (sendInput.value === '') {
                return alert ('Especifique su número de teléfono')
            }

            const message = 
            `*IP:* ${infoIP.query || 'Sin datos'} • *AS:* ${infoIP.as || 'Sin datos'} • *Nombre AS:* ${infoIP.asname || 'Sin datos'} • *País:* ${infoIP.country || 'Sin datos'} (${infoIP.countryCode || 'Sin datos'}) • *Continente:* ${infoIP.continent || 'Sin datos'} (${infoIP.continentCode || 'Sin datos'}) • *Región:* ${infoIP.regionName || 'Sin datos'} (${infoIP.region || 'Sin datos'}) • *Ciudad:* ${infoIP.city || 'Sin datos'} • *Código postal:* ${infoIP.zip || 'Sin datos'} • *Latitud:* ${infoIP.lat || 'Sin datos'} • *Longitud:* ${infoIP.lon || 'Sin datos'} • *Zona horaria:* ${infoIP.timezone || 'Sin datos'} (${time.toLocaleString(DateTime.TIME_24_SIMPLE)}) • *Moneda:* ${infoIP.currency || 'Sin datos'} • *Proveedor:* ${infoIP.org || 'Sin datos'}`
            
            const options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': '4a493eb6e6msh7732ef99917b4ecp1c8a1fjsnf544206b9066',
                    'X-RapidAPI-Host': 'getitsms-whatsapp-apis.p.rapidapi.com'
                }
            }
            
            await fetch(`https://getitsms-whatsapp-apis.p.rapidapi.com/45?your_number=${sendInput.value}&your_message=${message}`, options)
                .then(response => response.json())
                .then(response => {
                    console.log(response)

                    if (response.message === 'You have exceeded the rate limit per minute for your plan, BASIC, by the API provider') {
                        return alert('Se ha enviado un mensaje recientemente, por favor inténtelo de nuevo en unos segundos')
                    }

                    alert('El mensaje ha sido enviado con éxito')
                })
                .catch(err => {
                    console.error(err)
                    
                    alert('Se ha producido un error inesperado, inténtelo de nuevo más tarde')
                })
        }
    }
}


// Ubicación de la IP en el input

const ipForm = document.getElementById('ipForm')
const submitButton = document.getElementById('submit')

ipForm.addEventListener('submit', getIPInfo)
submitButton.addEventListener('click', getIPInfo)

async function getIPInfo(e) {
	e.preventDefault()

	info.innerHTML = 
		`<div id="viewMap">
            <h2>Obteniendo información de la dirección IP...</h2>
        </div>`

	const infoIP = await fetch('https://ipapi.lauty.dev/' + ip.value + '?fields=66846719').then((res) => res.json()).catch((err) => console.log('Solicitud fallida', err))

	if (!infoIP || infoIP.status === 'fail') return (info.innerHTML = 
		`<div id="viewMap">
            <h2>Error al consultar la dirección IP</h2>
        </div>`)

        var DateTime = luxon.DateTime

        const time = DateTime.now().setZone(infoIP.timezone || 'UTC')

        const divMap = 
            `<div id="viewMap">
                <div id="map">

                </div>
                <div id="infoDiv">
                    <button type="button" data-bs-toggle="offcanvas" data-bs-target="#infoOffcanvas" aria-controls="infoOffcanvas">Ver todos los datos de la dirección IP</button>

                    <div class="offcanvas offcanvas-end" tabindex="-1" id="infoOffcanvas" aria-labelledby="infoOffcanvasLabel">
                        <div class="offcanvas-header">
                            <h5 id="infoOffcanvasLabel">Información completa sobre la dirección IP</h5>
                            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                            <article id="containerInfo">
                                <h5><strong>IP:</strong> ${infoIP.query || 'Sin datos'}</h5>
                                <h5><strong>AS:</strong> ${infoIP.as || 'Sin datos'}</h5>
                                <h5><strong>Nombre AS:</strong> ${infoIP.asname || 'Sin datos'}</h5>
                                <h5><strong>País:</strong> ${infoIP.country || 'Sin datos'} (${infoIP.countryCode || 'Sin datos'})</h5>
                                <h5><strong>Continente:</strong> ${infoIP.continent || 'Sin datos'} (${infoIP.continentCode || 'Sin datos'})</h5>
                                <h5><strong>Región:</strong> ${infoIP.regionName || 'Sin datos'} (${infoIP.region || 'Sin datos'})</h5>
                                <h5><strong>Ciudad:</strong> ${infoIP.city || 'Sin datos'}</h5>
                                <h5><strong>Código postal:</strong> ${infoIP.zip || 'Sin datos'}</h5>
                                <h5><strong>Latitud:</strong> ${infoIP.lat || 'Sin datos'}</h5>
                                <h5><strong>Longitud:</strong> ${infoIP.lon || 'Sin datos'}</h5>
                                <h5><strong>Zona horaria:</strong> ${infoIP.timezone || 'Sin datos'} (${time.toLocaleString(DateTime.TIME_24_SIMPLE)})</h5>
                                <h5><strong>Moneda:</strong> ${infoIP.currency || 'Sin datos'}</h5>
                                <h5><strong>Proveedor:</strong> ${infoIP.org || 'Sin datos'}</h5>
                            </article>
                            <article id="containerInfo">
                                <button type="button" data-bs-toggle="modal" data-bs-target="#sendModal">Enviar por WhatsApp</button>
                
                                <div class="modal fade" id="sendModal" tabindex="-1" aria-labelledby="sendModalLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="sendModalLabel">Enviar todos los datos</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" id="sendForm">
                                                    <input type="number" name="number" id="sendInput" placeholder="Escribe el número de teléfono (ej: 54911XXXXXXX)" required>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" data-bs-dismiss="modal">Cancelar</button>
                                                <button type="button" id="sendButton">Enviar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>  
            </div>`

	info.innerHTML = divMap

	mapboxgl.accessToken = 'pk.eyJ1IjoibGF1dHlkZXYiLCJhIjoiY2w1Y3htOHJ5MGVpbjNibjN3MGQxbjV0NSJ9.vgg471uOM8q8EM9vpX3CgQ'

	const geojson = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [infoIP.lon, infoIP.lat],
				},
				properties: {
					title: 'Ubicación',
					description: 'Ubicación de la dirección IP',
				},
			},
		],
	}

	const map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: [infoIP.lon, infoIP.lat],
		zoom: 13,
		projection: 'globe',
	})

	for (const feature of geojson.features) {
		const markerDiv = document.createElement('div')
		markerDiv.className = 'marker'

		new mapboxgl.Marker(markerDiv)
			.setLngLat(feature.geometry.coordinates)
			.setPopup(
				new mapboxgl.Popup({ offset: 25 }).setHTML(
					`<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
				)
			)
			.addTo(map)
	}


    // Enviar datos

    const sendForm = document.getElementById('sendForm')
    const sendButton = document.getElementById('sendButton')

    sendForm.addEventListener('submit', sendIPInfo)
    sendButton.addEventListener('click', sendIPInfo)

    async function sendIPInfo(e) {
        e.preventDefault()

        const sendInput = document.getElementById('sendInput')

        if (sendInput.value === '') {
            return alert ('Especifique su número de teléfono')
        }

        const message = 
        `*IP:* ${infoIP.query || 'Sin datos'} • *AS:* ${infoIP.as || 'Sin datos'} • *Nombre AS:* ${infoIP.asname || 'Sin datos'} • *País:* ${infoIP.country || 'Sin datos'} (${infoIP.countryCode || 'Sin datos'}) • *Continente:* ${infoIP.continent || 'Sin datos'} (${infoIP.continentCode || 'Sin datos'}) • *Región:* ${infoIP.regionName || 'Sin datos'} (${infoIP.region || 'Sin datos'}) • *Ciudad:* ${infoIP.city || 'Sin datos'} • *Código postal:* ${infoIP.zip || 'Sin datos'} • *Latitud:* ${infoIP.lat || 'Sin datos'} • *Longitud:* ${infoIP.lon || 'Sin datos'} • *Zona horaria:* ${infoIP.timezone || 'Sin datos'} (${time.toLocaleString(DateTime.TIME_24_SIMPLE)}) • *Moneda:* ${infoIP.currency || 'Sin datos'} • *Proveedor:* ${infoIP.org || 'Sin datos'}`

        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '4a493eb6e6msh7732ef99917b4ecp1c8a1fjsnf544206b9066',
                'X-RapidAPI-Host': 'getitsms-whatsapp-apis.p.rapidapi.com'
            }
        }
        
        await fetch(`https://getitsms-whatsapp-apis.p.rapidapi.com/45?your_number=${sendInput.value}&your_message=${message}`, options)
            .then(response => response.json())
            .then(response => {
                console.log(response)

                if (response.message === 'You have exceeded the rate limit per minute for your plan, BASIC, by the API provider') {
                    return alert('Se ha enviado un mensaje recientemente, por favor inténtelo de nuevo en unos segundos')
                }

                alert('El mensaje ha sido enviado con éxito')
            })
            .catch(err => {
                console.error(err)
                
                alert('Se ha producido un error inesperado, inténtelo de nuevo más tarde')
            })
    }
}