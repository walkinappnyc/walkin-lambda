'use strict';

const parseString = require('xml2js').parseString
const request = require('request')
const fs = require('fs')
const dateTime = require('date-time')


const XMLUrl = `https://api.walk.in/api/Landlords`

module.exports.cron = (event, context, callback) => {
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // };
function getXMLFeeds() {
	let options = {
		url: `${XMLUrl}`,
		method: 'GET',
		headers: {
			'Accept': 'application/JSON'
		},
		json: true
	}

	const data = request(options, function(err, res, body) {
		let urlArr = []
		// console.log(urlArr)
		body.forEach(item => {
			console.log(`${JSON.stringify(item)}`)
			urlArr.push(item)
			// console.log(`${urlArrsa}`)
			return urlArr
		})
		createProperties(urlArr)
	})
}

getXMLFeeds()

function createProperties(xml_feeds) {
	console.log(`this is the array ${JSON.stringify(xml_feeds)}`)
	xml_feeds.forEach(feed => {
		console.log(`this is new feed ${feed}`)
		let item = feed

		// console.log(`feed: ${feed}`)
		// console.log(feed.id)
		// console.log(feed.company)

		request(`${item.xml_feed_url}`, function (err, res, body) {
			// console.log('error:', err)
			// console.log('statusCode:', res && res.statusCode)
			// console.log('body', body)

		let xml = body
		parseString(xml, function (err, result) {
	    	// console.dir(result)

	    	let dataJSON = JSON.stringify(result)
	    	// console.log(result.streeteasy)
	    	// console.log(result.streeteasy.properties)
	    	// console.log(result.streeteasy.properties[0])
	 //    console.log(`feed: ${item}`)
		// console.log(item.id)
		// console.log(item.company)


	    	result.streeteasy.properties[0].property.forEach(property => {
	    		// console.log(`++++++++++++ ${JSON.stringify(property)} ++++++++++++`)

	    		let {
	    			$,
	    			location,
	    			details,
	    			openHouses,
	    			agents,
	    			media,
	    			applyUrl
	    		} = property

	    		let data = {
	    			$,
	    			location,
	    			details,
	    			openHouses,
	    			agents,
	    			media
	    		}

	    		function transformTransportation(trains) {
				  const cleanTranportation = {};
				  const transportationList = [];
				  for (let i = 0; i < trains.length; i++) {
				    const train = cleanTranportation[trains[i].station];

				    if (train) {
				      train.line.push(trains[i].line);
				    } else {
				      cleanTranportation[trains[i].station] = {
				        line: [trains[i].line],
				        station: trains[i].station,
				        proximity: trains[i].proximity
				      };
				    }
				  }

				  Object.keys(cleanTranportation).map((key, value) => {
				    const train = cleanTranportation[key];
				    transportationList.push({
				      line: train.line,
				      station: train.station,
				      proximity: train.proximity
				    });
				  });
				  // console.log(transportationList)
				  return transportationList;
				}
	    		// console.log(`**** ${JSON.stringify(data)} ***`)
	    		// console.log(`**** ${JSON.stringify($)} ***`)
	    		// console.log(`**** ${JSON.stringify(location)} ***`)
	    		// console.log(`**** ${JSON.stringify(details)} ***`)
	    		// console.log(`**** ${JSON.stringify(openHouses)} ***`)
	    		// console.log(`**** ${JSON.stringify(openHouses[0].openHouses)} ***`)
	    		// console.log(`**** ${JSON.stringify(agents)} ***`)
	    		// console.log(`**** ${JSON.stringify(media)} ***`)
	    		// console.log(`**** ${JSON.stringify(applyUrl)} ***`)

	    		let photoArray = media[0].photo || null
				// console.log(JSON.stringify(photoArray))

				let parsedMedia = []

				if (photoArray != null) {
					photoArray.forEach(photo => {
						let tempObj = {}
						tempObj["type"] = "photo"
						// console.log(tempObj)
						tempObj["url"] = photo.$.url
						tempObj["description"] = photo.$.description
						tempObj["position"] = photo.$.position
						parsedMedia.push(tempObj)
						// console.log(parsedPhotos)
						return parsedMedia
					})
				}


				let floorplanArray = media[0].floorplan || null

				// console.log(JSON.stringify(floorplanArray))

				if (floorplanArray != null) {
					floorplanArray.forEach(floorplan => {
						let tempObj = {}
						tempObj["type"] = "floorplan"
						// console.log(tempObj)
						tempObj["url"] = floorplan.$.url
						tempObj["description"] = floorplan.$.description
						tempObj["position"] = null
						parsedMedia.push(tempObj)
						// console.log(parsedFloorplans)
						return parsedMedia
					})
				}

				// let mediaArray = []

				// mediaArray.push(photoArray)
				// mediaArray.push(floorplanArray)
				// console.log(JSON.stringify(parsedMedia))

	    		let template = {
				  "xml_id":"",
				  "apply_url": "",
				  "landlord":{
				    "company":""
				  },
				  "location":{},
				  "contact":{
				    "contact_email":"",
				    "apply_url":"",
				    "phone_number":""
				  },
				  "agents":[
				    {
				      "name":"",
				      "company":"",
				      "email":"",
				      "phone_number":""
				    }
				  ],
				  "details":{
				    "amenities":{
				      "unit":"",
				      "building":""
				    },
				    "bathrooms":1,
				    "bedrooms":1,
				    "description":{
				      "unit":"",
				      "building": ""
				    },
				    "half_baths":0,
				    "no_fee":true,
				    "price":2888,
				    "property_type":"rental or purchase",
				    "special_offers":"1 Year Free Gym, First Month Free",
				    "total_rooms":3.0,
				    "transportation":{
				      "trains":"CSV",
				      "buses":"CSV"
				    }
				  },
				  "open_houses":[],
				  "media":[],
				  "transportation": [],
				  "incentives": [],
				  "isActive": false,
				  "neighborhood": "",
				  "nav_city": "",
				  "nav_state": ""
				}

				let str = `${details[0].price[0]}` + `${location[0].address[0]}` + `${location[0].apartment[0]}` + `${location[0].city[0]}` + `${location[0].state[0]}` + `${location[0].zipcode[0]}`
	    		// console.log(`${str}`)
	    		let downcase = str.toLowerCase()
	    		let xml_id = downcase.replace(/ /g,'')
	    		console.log(`${xml_id}`)

				template.xml_id = `${xml_id}`
				template.apply_url = applyUrl
				template.location = {
					"address": `${location[0].address[0]}`,
					"apartment": `${location[0].apartment[0]}`,
					"city": `${location[0].city[0]}`,
					"state": `${location[0].state[0]}`,
					"zipcode": `${location[0].zipcode[0]}`,
					"neighborhood": `${location[0].neighborhood[0]}`
				}
				// console.log(`${location[0].neighborhood[0]}`)
				template.neighborhood = `${location[0].neighborhood[0]}`
				template.nav_city = `${location[0].city[0]}`
				template.nav_state = `${location[0].state[0]}`
				template.agents = [ 
					{
						"name": `${agents[0].agent[0].name[0]}`,
						"company": `${agents[0].agent[0].company[0]}`,
						"email": `${agents[0].agent[0].email[0]}`,
						"phone_number": `${agents[0].agent[0].phone_numbers[0].main[0]}`
					}
				]
				// console.log(item)
				// console.log(`${JSON.stringify(details[0].amenities[0].building[0].amenity)}`)
				// console.log(`${JSON.stringify(details[0].incentives[0])}`)
				// console.log(`${JSON.stringify(details[0].transportation[0].trains[0].train)}`)

				let parsedTrains = []
				let transportation = details[0].transportation[0].trains[0].train || null
				// console.log(`${transportation}`)
				if (transportation != null) {
					transportation.forEach(train => {
						let tempObj = {}
						tempObj["line"] = train.line[0]
						// console.log(tempObj)
						tempObj["station"] = train.station[0]
						tempObj["proximity"] = train.proximity[0]

						parsedTrains.push(tempObj)
						// console.log(parsedTrains)
						return parsedTrains
					})
				}

				let otherTransportation = details[0].transportation[0].other || null

				// console.log(`${JSON.stringify(otherTransportation)}`)

				if (otherTransportation != null) {
					otherTransportation.forEach(train => {
						let tempObj = {}
						tempObj["line"] = train.line[0]
						// console.log(tempObj)
						tempObj["station"] = train.station[0]
						tempObj["proximity"] = train.proximity[0]

						parsedTrains.push(tempObj)
						// console.log(parsedTrains)
						return parsedTrains
					})
				}


				let incentives = details[0].incentives[0].incentive || null
				// console.log(incentives)
				let parsedIncentives = []

				if (incentives != null) {
					incentives.forEach(incentive => {
						let tempObj = {}
						// console.log(`${incentive}`)
						tempObj["name"] = incentive.name[0]
						// console.log(tempObj)
						tempObj["description"] = incentive.description[0]


						parsedIncentives.push(tempObj)
						// console.log(parsedIncentives)
						return parsedIncentives
					})
				}

				template.details = {
					"amenities": {
						"unit": `${details[0].amenities[0].unit[0].amenity}`,
						"building": `${details[0].amenities[0].building[0].amenity}`		
					},
					"bathrooms": `${details[0].bathrooms[0]}`,
					"bedrooms": `${details[0].bedrooms[0]}`,
					"description": {
						"unit": `${details[0].description[0].unit}`,
						"building": `${details[0].description[0].building}`
						
					},
					"half_baths": `${details[0].half_baths[0]}`,
					"no_fee": `${details[0].noFee[0]}`,
					"price": `${details[0].price[0]}`,
					"property_type": `${details[0].propertyType[0]}`,
					"total_rooms": `${details[0].totalrooms[0]}`
					
				}

				let unit = details[0].amenities[0].unit[0].amenity

				if (`${JSON.stringify(unit)}` == "undefined") {

					template.details.amenities["unit"] = null
					// console.log(`${JSON.stringify(template.details.amenities)}`)
				}

				let building = details[0].amenities[0].building[0].amenity

				if (`${JSON.stringify(building)}` == "undefined") {

					template.details.amenities["building"] = null
					// console.log(`${JSON.stringify(template.details.amenities)}`)
				}

				// console.log(`${details[0].noFee[0]}`)
				if (details[0].noFee[0] === "") {
					// console.log(`true`)
					template.details["no_fee"] = true
				} else {
					// console.log(`false`)
					template.details["no_fee"] = false
				}

				let openHouseArray = []
	    		if (openHouses) {
	    			let obj = []
	    			// openHouseArray.push(openHouses[0].openHouse)
	    			// template.open_houses = openHouses[0].openHouse
	    			// console.log(`${JSON.stringify(openHouses[0].openHouse)}`)
	    			openHouses[0].openHouse.forEach(openHouse => {
	    				let tempObj = {}
	    				tempObj["startsAt"] = openHouse.startsAt[0]
	    				tempObj["endsAt"] = openHouse.endsAt[0]
	    				obj.push(tempObj)
	    				// console.log(`${JSON.stringify(obj)}`)
	    			})
	    			template.open_houses = obj
	    			// console.log(`${JSON.stringify(openHouseArray)}`)
	    		} else {
	    			// openHouseArray = openHouses[0].openHouse
	    			// console.log(`${openHouseArray}`)
	    			template.open_houses = openHouseArray
	    		}

				// console.log(`----${JSON.stringify(openHouseArray)}`)
				// template.open_houses = openHouseArray
				let transformedTrains = transformTransportation(parsedTrains)
				// console.log(`${transformedTrains}`)
				template.media = parsedMedia
				template.transportation = transformedTrains
				template.incentives = parsedIncentives
				template.landlordId = item.id
				template.isActive = item.isActive
				template.landlord = item.company
				template.updated_at = dateTime()

				// console.log(`${item.id}`)
				// console.log(`${item.isActive}`)
				// console.log(`${item.company}`)

				// console.log(JSON.stringify(item.media[0].photo))

				// let photoArray = item.media[0].photo
				// console.log(JSON.stringify(photoArray))

				// let parsedPhotos = []

				// photoArray.forEach(photo => {
				// 	parsedPhotos.push(photo.$)
				// 	console.log(parsedPhotos)
				// 	return parsedPhotos
				// })


	    		let options = {
		    		url: 'https://api.walk.in/api/Properties',
		    		method: 'PATCH',
		    		headers: {
		    			'Accept': 'application/JSON'
		    		},
		    		json: true,
		    		body: template
	    		}

	    		request(options, function(err, res, body) {
	    			// console.log(JSON.stringify(item.details))
	    			// console.log(body)
	    		})
	    	})
		})
		})
	})
}




  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
