
/*var defaultLat = 37.7750;
var defaultLong = -122.4183;*/
      

//var mapCenter = new google.maps.LatLng(defaultLat,defaultLong);
var map;

var zipCodeArray = new Array();
    
var infoArray = new Array();


var mapOptions = {
          center: new google.maps.LatLng(37.7750, -122.4183),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
       };

$( '#five' ).bind( "pageshow", function(){
  
  console.log('page show');

    initializeMap();
	findStoresUsingZipcode();
    findDistanceBetweenTwoPlaceUsingLatAndLong();
                  

});


function initializeMap(){

	console.log('initializeMap');

 	map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);

 	console.log("Map was initialed.....");
                        
}




function findZipCodeAtCurrentLocation() {


	alert('findZipCodeAtCurrentLocation');
	console.log('findZipCodeAtCurrentLocation');

	// clear the previous data
	/*zipCodeArray = [];*/

	var xmlHttpForStoreZipCode;
	
	if (window.XMLHttpRequest) {
		xmlHttpForStoreZipCode = new XMLHttpRequest();
	}
	
	xmlHttpForStoreZipCode
			.open(
					"GET",
					"http://maps.googleapis.com/maps/api/geocode/json?latlng=37.7,-117.2&sensor=false&sensor=false",
					true);
	
	xmlHttpForStoreZipCode.send();

	xmlHttpForStoreZipCode.onreadystatechange = function() {
	
		if (xmlHttpForStoreZipCode.readyState == 4
				&& xmlHttpForStoreZipCode.status == 200) {

			var xmlDocForZipcode = xmlHttpForStoreZipCode.responseText;
			var parsedString = JSON.parse(xmlDocForZipcode);

			console.log("Response string ==" + xmlDocForZipcode);
			
			

			for ( var i = 0; i < 1; i++) {
				zipCodeArray[i] = parsedString.results[i].address_components[5].long_name;
				console.log("Zip Code Arrat === "+i+" ==  ---->"+parsedString.results[i].address_components[5].long_name);
			}
		}
	}
}


// arrays to store the data
var storesNameAtParticularZipcode = new Array();
var storesAddressAtParticularZipcode = new Array();
var storesCityNameAtZipcode = new Array();


function findStoresUsingZipcode() {

	console.log('findStoresUsingZipcode');
	
	
	storesNameAtParticularZipcode = [];
	storesAddressAtParticularZipcode = [];
	storesCityNameAtZipcode = [];

	var xmlhttpForStoresAtZipcode;
	
	if (window.XMLHttpRequest) {
		xmlhttpForStoresAtZipcode = new XMLHttpRequest();
	} else {
		xmlhttpForStoresAtZipcode = new ActiveXObject("Microsoft.XMLHTTP");
	}



	// hard coded zip value....................

	xmlhttpForStoresAtZipcode
			.open(
					"GET",
					"http://www.supermarketapi.com/api.asmx/StoresByZip?APIKEY=93da6ed905&ZipCode=94109",
					true);
	
	xmlhttpForStoresAtZipcode.send();



	xmlhttpForStoresAtZipcode.onreadystatechange = function() {

		if (xmlhttpForStoresAtZipcode.readyState == 4
				&& xmlhttpForStoresAtZipcode.status == 200) {


			// parsing

			var xmlDocForStores = xmlhttpForStoresAtZipcode.responseXML;

			console.log("Response TEXT == "+xmlhttpForStoresAtZipcode.responseText);

			storeName = xmlDocForStores.getElementsByTagName("Storename");
			addressForStore = xmlDocForStores.getElementsByTagName("Address");
			cityForStore = xmlDocForStores.getElementsByTagName("City");


			console.log('storeName.length === '+ storeName.length);
			console.log('addressForStore.length === '+ addressForStore.length);
			console.log('cityForStore.length === '+ cityForStore.length);

			for (i = 0; i < storeName.length; i++) {
				storesNameAtParticularZipcode[i] = storeName[i].childNodes[0].nodeValue;
			}

			

			for (i = 0; i < addressForStore.length; i++) {
				storesAddressAtParticularZipcode[i] = addressForStore[i].childNodes[0].nodeValue;
			}

			

			for (i = 0; i < cityForStore.length; i++) {
				storesCityNameAtZipcode[i] = cityForStore[i].childNodes[0].nodeValue;
			}


			// printing 

			for (i = 0; i < storeName.length; i++) {
				console.log('storesNameAtParticularZipcode  '+ i +' ==='+storesNameAtParticularZipcode[i]);
			}
			for (i = 0; i < addressForStore.length; i++) {
				console.log('storesAddressAtParticularZipcode  '+ i +' ==='+storesAddressAtParticularZipcode[i]);				
			}
			for (i = 0; i < cityForStore.length; i++) {
				console.log('storesCityNameAtZipcode  '+ i +' ==='+storesCityNameAtZipcode[i]);		
			}


			console.log(' OLD storesNameAtParticularZipcode.length ==== '+ storesNameAtParticularZipcode.length);


						makeURLToGetLatLongOfAllStores();
		}
	}

	
}





var storeNameForLatAndLong, storeAddressForLatAndLong, storeCityForLatAndLong, urlForLatAndLong;

function makeURLToGetLatLongOfAllStores() {

	console.log('makeURLToGetLatLongOfAllStores');

	console.log(' IN FUNC storesNameAtParticularZipcode.length ==== '+ storesNameAtParticularZipcode.length);

	for ( var i = 0; i < storesNameAtParticularZipcode.length; i++) {

		storeNameForLatAndLong = storesNameAtParticularZipcode[i];
		storeCityForLatAndLong = storesCityNameAtZipcode[i];
		storeAddressForLatAndLong = storesAddressAtParticularZipcode[i];

		urlForLatAndLong = 'http://maps.googleapis.com/maps/geo?output=json&q='
				+ storeNameForLatAndLong + storeAddressForLatAndLong
				+ storeCityForLatAndLong;

		console.log('urlForLatAndLong === '+ i +'-------------->>>>  '+urlForLatAndLong);

		// calling function
		getLatAndLongFromUrl(urlForLatAndLong);

	}
}


function getLatAndLongFromUrl(urlOfStores) {
	
	console.log('getLatAndLongFromUrl');

    infoArray = [];


	var xmlHttpForLatAndLongOfStore;
	if (window.XMLHttpRequest) {
		xmlHttpForLatAndLongOfStore = new XMLHttpRequest();
	}

	xmlHttpForLatAndLongOfStore.open("GET", urlOfStores, true);
	xmlHttpForLatAndLongOfStore.send();
	
	xmlHttpForLatAndLongOfStore.onreadystatechange = function() {
		if (xmlHttpForLatAndLongOfStore.readyState == 4
				&& xmlHttpForLatAndLongOfStore.status == 200) {

			var xmlDocForZipcode = xmlHttpForLatAndLongOfStore.responseText;
			console.log("RESPONSE TXT ====  "+xmlDocForZipcode);

			var parsedString = JSON.parse(xmlDocForZipcode);


			console.log('parsedString.Status.code == '+parsedString.Status.code);

			if(parsedString.Status.code==200){

				console.log("Store NAME ====    " + storeNameForLatAndLong);
				console.log("STORE ADDRESS ==== " + storeAddressForLatAndLong);
				console.log("Latitude =====  "    + parsedString.Placemark[0].Point.coordinates[0]);
				console.log("Longitude ===== "    + parsedString.Placemark[0].Point.coordinates[1]);

			

				var storeDescriptionArray = new Array();

				storeDescriptionArray[0] = storeNameForLatAndLong;
				storeDescriptionArray[1] = parsedString.Placemark[0].Point.coordinates[1];
				storeDescriptionArray[2] = parsedString.Placemark[0].Point.coordinates[0];
				storeDescriptionArray[3] = storeAddressForLatAndLong;


				console.log(' storeDescriptionArray'+storeDescriptionArray);

				console.log('storeDescriptionArray [0] == '+storeDescriptionArray[0]);
				console.log('storeDescriptionArray [1] == '+storeDescriptionArray[1]);
				console.log('storeDescriptionArray [2] == '+storeDescriptionArray[2]);
				console.log('storeDescriptionArray [3] == '+storeDescriptionArray[3]);


				console.log('storeDescriptionArray LENGTH ==='+storeDescriptionArray.length);
				console.log('storeDescriptionArray==='+storeDescriptionArray);

				infoArray.push(storeDescriptionArray);


				console.log('INFO ARRAY LENGTH == '+infoArray.length);


				// calling function ...
				addMarkers(infoArray);
			}
		}
	}	
}


function addMarkers(infoArray) {

	console.log('addMarkers');


	console.log('addMarkers()....   INFO ARRAY LENGTH == '+infoArray.length);

	// print the actual retrieved PINS (stores)
	for(var i=0;i<infoArray.length;i++){
		console.log("DATA ------>>>> "+i+"----->"+infoArray[0]);
	}



	var marker, i = 0, infoBubble;
	var pinImage = 'images/pin.png';
	var currentLocationImage = 'images/dot.png';


	// current location
	marker = new google.maps.Marker({
		position : new google.maps.LatLng(37.3970, -122.4183),
		map : map,
		icon : currentLocationImage
	});

	// add all markers
	for (i = 0; i < infoArray.length; i++) {

		var marker = new google.maps.Marker(
				{
					map : map,
					position : new google.maps.LatLng(infoArray[i][1],
							infoArray[i][2]),
					draggable : false,
				// icon:pinImage
				});
	}

	infoBubble = new InfoBubble({
		map : map,
		// content: contentString,
		// shadowStyle: 1,
		padding : 0,
		backgroundColor : 'rgb(57,57,57)',
		borderRadius : 4,
		arrowSize : 10,
		borderWidth : 1,
		borderColor : '#2c2c2c',
		// disableAutoPan: true,
		hideCloseButton : false,
		// arrowPosition: 30,
		// backgroundClassName: 'phoney',
		arrowStyle : 0
	});

	google.maps.event
			.addListener(
					marker,
					'click',
					(function(marker, i) {
						return function() {
							infoBubble.open(map, marker);
							infoBubble
									.setContent('<div id="content"><div class="bubble_box"><p class="bubble_percent">95%</p><p class="bubble_items">10/11 ITEMS</p></div><div class="bubble_data"><p class="bubble_header">Aamir Shah</p><p class="bubble_miles"> 0.21 Miles </p></div></div>');
						}
					})(marker, i));
}


function findDistanceBetweenTwoPlaceUsingLatAndLong()
{
    console.log("hello");
    alert("hello");
    
//    alert(infoArray[0][1]);
//    alert(infoArray[0][2]);
//    
//    var urlForCalculatindDistance = "http://maps.googleapis.com/maps/api/directions/json?origin=37.3970,-122.4183&destination="+infoArray[0][1]+","+infoArray[0][2]+"&sensor=false&mode=driving";
//    console.log("url are==="+urlForCalculatindDistance);
//    
//    
//    var xmlHttpForDistanceToStore;
//    if (window.XMLHttpRequest)
//    {
//        xmlHttpForDistanceToStore = new XMLHttpRequest();
//    }
//    xmlHttpForDistanceToStore.open("GET",urlForCalculatindDistance,true);              
//    xmlHttpForDistanceToStore.send();
//    xmlHttpForDistanceToStore.onreadystatechange=function()
//    {
//        if(xmlHttpForDistanceToStore.readyState==4 && xmlHttpForDistanceToStore.status==200)
//        {
//            alert("inside");
//            var xmlToParseForDistance = xmlHttpForDistanceToStore.responseText;
//            var parsedString = JSON.parse(xmlToParseForDistance);
//            
//            console.log("parsing string are:"+parsedString.routes[0].legs[0].distance.text);
//        }
//    }
}



function CheckAvailabilityAtURL(urlForCheckingAvailability1)
{
    var xmlhttp;
    if (window.XMLHttpRequest)
    {
        xmlhttp=new XMLHttpRequest();
    }
    else
    {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET",urlForCheckingAvailability1,true);
    xmlhttp.send();
    
    
    xmlhttp.onload=function()
    {
        
        var xmlDoc = xmlhttp.responseXML;
        var items = xmlDoc.getElementsByTagName("Product");
        for (var c=0;c<items.length;c++)
        {
            var item = items.item(c);
            var itemName = item.getElementsByTagName("Itemname").item(0).text;
            var category = item.getElementsByTagName("ItemCategory").item(0).text;
            var thumbnail =  item.getElementsByTagName("ItemImage").item(0).text;
            var id =  item.getElementsByTagName("ItemID").item(0).text;
            
            console.log("array are : " +itemName);
            
            
        }
    }
}


function ProductAvailableAtStoreUsingStoreID()
{
    alert("check availability");
    var productArray = ['Apples','Gerber 100% Apple Juice - 32 Fl. Oz.','Gerber Apple Juice - 4-4 Fl. Oz.','Gerber Organic Apple Juice - 4-4 Fl. Oz.','Pedialyte Tetra/Brick Pk Apple Flavor - 4-6.8 Fl. Oz.','Gerber Finger Foods Fruit Wagon Wheels Apples - 1.48 Oz'];
    
    var storeIDArray = ['a995a35f8f','e6k3fjw215k'];
    
    for(var i= 0 ;i<storeIDArray.length;i++)
    {
        for(var j=0; j<productArray.length; j++)
        {
            var urlForCheckingAvailability = "http://www.supermarketapi.com/api.asmx/SearchForItem?APIKEY=93da6ed905&StoreId="+storeIDArray[i]+"&ItemName="+productArray[j];
            console.log("url are checking = "+urlForCheckingAvailability);
            CheckAvailabilityAtURL(urlForCheckingAvailability);
        }
    }
}



