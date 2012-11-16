



var currentLat = 37.7953876;
var currentLong = -122.4224529;


//var mapCenter = new google.maps.LatLng(defaultLat,defaultLong);
var map;

var zipCodeArray = new Array();

var infoArray = new Array();


var mapOptions = {
center: new google.maps.LatLng(37.7550, -122.4183),
zoom: 12,
mapTypeId: google.maps.MapTypeId.ROADMAP
};

$( '#five' ).bind( "pageshow", function(){
                  
                  console.log('page show');
                  
                  $.mobile.showPageLoadingMsg();
                  
                  var fromBackToStores = window.localStorage.getItem("fromBackToStores"); 
                  
                  if ( fromBackToStores == 12345 ) {
                  
                  window.localStorage.setItem("fromBackToStores",111);
                  $.mobile.hidePageLoadingMsg();
                  }else{
                  
                  initializeMap();
                  findZipCodeAtCurrentLocation();
                  
                  
                  }
                  
                  
                  
                  
                  });


function initializeMap(){
    
	console.log('initializeMap');
    
 	map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);
    
 	console.log("Map was initialed.....");
    
    
    
}

var xmlHttpForStoreZipCode = new XMLHttpRequest();

function getZip(){
	
    if (xmlHttpForStoreZipCode.readyState == 4
        && xmlHttpForStoreZipCode.status == 200) {
        
        var xmlDocForZipcode = xmlHttpForStoreZipCode.responseText;
        var parsedString = JSON.parse(xmlDocForZipcode);
        
        console.log("Response string ==" + xmlDocForZipcode);
        
        
        
        
        var zipCodeAtCurrentLocation = parsedString.results[0].address_components[7].long_name;
        console.log('zipCodeAtCurrentLocation'+zipCodeAtCurrentLocation);
        
        
        
        findStoresUsingZipcode(zipCodeAtCurrentLocation); 
        
        
    }
}

xmlHttpForStoreZipCode.onreadystatechange = getZip;


function findZipCodeAtCurrentLocation() {
	
	console.log('findZipCodeAtCurrentLocation');
    
	
	xmlHttpForStoreZipCode
    .open(
          "GET",
          'http://maps.googleapis.com/maps/api/geocode/json?latlng='+currentLat+','+currentLong+'&sensor=false&sensor=false',
          false);
	
	xmlHttpForStoreZipCode.send();
    
	
}


// arrays to store the data
var storesNameAtParticularZipcode = new Array();
var storesAddressAtParticularZipcode = new Array();
var storesCityNameAtZipcode = new Array();
var s_storeIdArray = new Array();

var	xmlhttpForStoresAtZipcode = new XMLHttpRequest();



function getTheStores() {
    
    if (xmlhttpForStoresAtZipcode.readyState == 4
        && xmlhttpForStoresAtZipcode.status == 200) {
        
        
        // parsing
        
        var xmlDocForStores = xmlhttpForStoresAtZipcode.responseXML;
        
        console.log("Response TEXT == "+xmlhttpForStoresAtZipcode.responseText);
        
        storeName = xmlDocForStores.getElementsByTagName("Storename");
        addressForStore = xmlDocForStores.getElementsByTagName("Address");
        cityForStore = xmlDocForStores.getElementsByTagName("City");
        id_stores=xmlDocForStores.getElementsByTagName("StoreId");
        
        console.log('storeName.length === '+ storeName.length);
        console.log('addressForStore.length === '+ addressForStore.length);
        console.log('cityForStore.length === '+ cityForStore.length);
        
        
        for (var i = 0; i < id_stores.length; i++) {
            // ID
            s_storeIdArray.push(id_stores[i].childNodes[0].nodeValue);
            console.log(s_storeIdArray[i]);	
            
            // Name
            storesNameAtParticularZipcode[i] = storeName[i].childNodes[0].nodeValue;
            console.log('storesNameAtParticularZipcode  '+ i +' ==='+storesNameAtParticularZipcode[i]);
            
            // Address
            storesAddressAtParticularZipcode[i] = addressForStore[i].childNodes[0].nodeValue;
            console.log('storesAddressAtParticularZipcode  '+ i +' ==='+storesAddressAtParticularZipcode[i]);				
            
            // City Name
            storesCityNameAtZipcode[i] = cityForStore[i].childNodes[0].nodeValue;
            console.log('storesCityNameAtZipcode  '+ i +' ==='+storesCityNameAtZipcode[i]);		
        }
        
        
        
        createStoreTable();
        
        // makeURLToGetLatLongOfAllStores(); is called in the db success
    }
}


xmlhttpForStoresAtZipcode.onreadystatechange = getTheStores;

function findStoresUsingZipcode(zipCodeAtCurrentLocation) {
    
	console.log('findStoresUsingZipcode');
	
	s_storeIdArray = [];
	storesNameAtParticularZipcode = [];
	storesAddressAtParticularZipcode = [];
	storesCityNameAtZipcode = [];
    
	
	xmlhttpForStoresAtZipcode
    .open(
          "GET",
          "http://www.supermarketapi.com/api.asmx/StoresByZip?APIKEY=93da6ed905&ZipCode="+zipCodeAtCurrentLocation,
          false);
    
	xmlhttpForStoresAtZipcode.send();
    
}












/***************************** STORE ID DATABASE *************************/







function createStoreTable(){
    console.log("inside createStoreTable() !!!!");
    
    
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(storePopulate, storeError, storeSuccess);
}



// Create the database (Populate the database)
function storePopulate(tx) {
    
  	console.log("storePopulate....()");
    
  	// Create table for each store.
	for (var i = 0; i < s_storeIdArray.length; i++) {
        
		// table name should begin with alphabet
		var store_table_name = "STORE_"+s_storeIdArray[i];
      	console.log('STORE table to be created is ='+store_table_name);
        
        
        
    	var dropListSQL = 'DROP TABLE IF EXISTS '+store_table_name;
      	console.log(dropListSQL);
      	tx.executeSql(dropListSQL);
        
      	var createStoreTableSQL = 'CREATE TABLE IF NOT EXISTS ' + store_table_name + '(id integer primary key autoincrement, storeItemName  , storeItemCategory, storeItemID,  storeItemImage, storeAisleNumber, storeQuantity,storeAvailable)';      																												
      	console.log("createStoreTableSQL   ="+createStoreTableSQL);
        tx.executeSql(createStoreTableSQL);
	}
}


// Transaction error callback
function storeError(err) {
    alert("storeError::--- Error processing SQL: "+err);
}

// Transaction success callback
function storeSuccess() {
    
    console.log("STORE  table is created...   :) ");
    
    
    // calling the function ..............     
    makeURLToGetLatLongOfAllStores();
}





function insertRecordInStore(nameOfStore, storeItemNameArray  , storeItemCategoryArray, storeItemIDArray,  storeItemImageArray, storeAisleNumberArray, storeQuantity,storeAvailableArray) {
    console.log("Inserting into DB ....");
    
    var table_store = 'STORE_'+nameOfStore;
    
    
    var insertStatement = 'INSERT INTO '+table_store+'(storeItemName  , storeItemCategory, storeItemID,  storeItemImage, storeAisleNumber, storeQuantity,storeAvailable) VALUES (?,?,?,?,?,?,?)';
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   for(var i=0;i<storeItemNameArray.length;i++){
                   tx.executeSql(insertStatement, [storeItemNameArray[i]  , storeItemCategoryArray[i], storeItemIDArray[i],  storeItemImageArray[i], storeAisleNumberArray[i], storeQuantity,storeAvailableArray[i]],insertedStoreSucess, storeError);
                   }
                   });
}





function insertedStoreSucess(){
	
    console.log('Inserted Successfully...');
    
}



/////////////////////////////////////////////////////////////////////////




function getAllCategoriesFromStoreTable(){
    
    bufferCategoriesOfStore = [];
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(queryCategoriesInStoreTable, errorAU);
    
}


function queryCategoriesInStoreTable(tx) {
    
    console.log("queryCategoriesInStoreTable(tx)");
    
    
    var store_id = window.localStorage.getItem("store_id")
    var store_full_name = 'STORE_'+store_id;
    window.localStorage.setItem("store_full_name",store_full_name);
    
    var queryCategoriesInStoreTableStatement = 'SELECT distinct storeItemCategory FROM "'+store_full_name+'"';
    tx.executeSql(queryCategoriesInStoreTableStatement, [], queryCategoriesInListTableSuccess, errorAU);
}




var bufferCategoriesOfStore = new Array();

function queryCategoriesInListTableSuccess(tx, results) {
    
    
    
    console.log("queryCategoryInListTableSuccess()...");
    
    var len = results.rows.length;
    console.log('Total categories IN STORE == '+len);
    
    // buffer all the categories of that particular list
    for(var i=0;i<len;i++){
        bufferCategoriesOfStore.push(results.rows.item(i).storeItemCategory);
    }
    
    console.log('data buffered');
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(fetchSubListAvailableInStore, errorAU);  
    
}




function fetchSubListAvailableInStore(tx) {
    
    console.log("fetchSubListAvailableInStore(tx)");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    console.log('bufferCategoriesOfStore.length === ' + bufferCategoriesOfStore.length);
    
    
    for(var i=0;i<bufferCategoriesOfStore.length;i++){
        console.log('bufferCategoriesOfStore ['+i+'] === '+bufferCategoriesOfStore[i]);
    }
    
    /* var arraySpliceIndex = bufferCategoriesOfStore.indexOf('null');
     bufferCategoriesOfStore.splice(arraySpliceIndex,1);
     
     console.log('bufferCategoriesOfStore == AFTER REMOVING NULL ');
     for(var i=0;i<bufferCategoriesOfStore.length;i++){
     console.log('bufferCategoriesOfStore ['+i+'] === '+bufferCategoriesOfStore[i]);
     }*/
    
    // clear the previous UI
    $('#master_list_avialable').empty();
    
    for(var i=0;i<bufferCategoriesOfStore.length;i++){
        
        // get the title of the list
        var name_of_store = window.localStorage.getItem("store_full_name");
        console.log("name_of_store == "+name_of_store);
        
        var fetchSubListStatement = 'SELECT storeItemName  , storeItemCategory, storeItemID,  storeItemImage, storeAisleNumber, storeQuantity,storeAvailable FROM '+name_of_store+'  WHERE storeAvailable = "yes" AND storeItemCategory = "'+bufferCategoriesOfStore[i]+'"';
        
        
        console.log('fetchSubListStatement == '+fetchSubListStatement);
        
        tx.executeSql(fetchSubListStatement, [], fetchSubListStoreSuccess, errorAU);
    }
}


function fetchSubListStoreSuccess(tx, results) {
    
    console.log("fetchSubListStoreSuccess()...");
    
    var len = results.rows.length;
    console.log('Total Sub items in this list  == '+len);
    
    if(len != 0){
        
      	console.log('category == '+results.rows.item(0).storeItemCategory);
        
      	$('#master_list_avialable').append('<li class="categories_major"><p class="text_of_category_store">'+results.rows.item(0).storeItemCategory+'</p></li>');
        
      	for(var i=0;i<len;i++){                
        	$('#master_list_avialable').append('<li class="custom_listview_img_edge_au"><img width="45" height="45" class="sub_category_img" src="'+results.rows.item(0).storeItemImage+'"/><h6 class="sub_category_name">'+results.rows.item(i).storeItemName+'</h6><p class="sub_category_quantity"> QTY :- ' + results.rows.item(i).storeQuantity + ' </p></li>');
        	$('#show_available').html('AVAIABLE ('+len+')');
      	}
        
      	// after adding all the rows refresh the master list
      	$('#master_list_avialable').listview('refresh');           
        
  	}else{
  	    //$('#master_list_avialable').empty();
  	}
    
  	// check un-available ITEMS
    
  	getUnAvaialableItemsInStore();
}






// first call getAvaiable only then call this func()


function getUnAvaialableItemsInStore(){
    // first call getAvaiable only then call this func() coz category array will be properly populated....
    
    
    console.log("getUnAvaialableItemsInStore()...");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(fetchSubListUnAvailableInStore, errorAU);  
    
}






function fetchSubListUnAvailableInStore(tx) {
    
    console.log("fetchSubListUnAvailableInStore(tx)");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    console.log('bufferCategoriesOfStore.length === ' + bufferCategoriesOfStore.length);
    
    
    for(var i=0;i<bufferCategoriesOfStore.length;i++){
        console.log('bufferCategoriesOfStore ['+i+'] === '+bufferCategoriesOfStore[i]);
    }
    
    // clear the previous UI
    $('#master_list_un_avialable').empty();
    
    for(var i=0;i<bufferCategoriesOfStore.length;i++){
        
        // get the title of the list
        var name_of_store = window.localStorage.getItem("store_full_name");
        console.log("name_of_store == "+name_of_store);
        
        var fetchSubListUnAvailableStatement = 'SELECT storeItemName  , storeItemCategory, storeItemID,  storeItemImage, storeAisleNumber, storeQuantity,storeAvailable FROM '+name_of_store+'  WHERE storeAvailable = "no" AND storeItemCategory = "'+bufferCategoriesOfStore[i]+'"';
        
        
        console.log('fetchSubListUnAvailableStatement == '+fetchSubListUnAvailableStatement);
        
        tx.executeSql(fetchSubListUnAvailableStatement, [], fetchSubListUnAvailableStoreSuccess, errorAU);
    }
}


function fetchSubListUnAvailableStoreSuccess(tx, results) {
    
    console.log("fetchSubListUnAvailableStoreSuccess()...");
    
    var len = results.rows.length;
    console.log('Total Sub items in this list  == '+len);
    
    if(len != 0){
        
      	console.log('category == '+results.rows.item(0).storeItemCategory);
        
      	$('#master_list_un_avialable').append('<li class="categories_major"><p class="text_of_category_store">'+results.rows.item(0).storeItemCategory+'</p></li>');
        
      	for(var i=0;i<len;i++){                
        	$('#master_list_un_avialable').append('<li class="custom_listview_img_edge_au"><img width="45" height="45" class="sub_category_img" src="'+results.rows.item(0).storeItemImage+'"/><h6 class="sub_category_name">'+results.rows.item(i).storeItemName+'</h6><p class="sub_category_quantity"> QTY :- ' + results.rows.item(i).storeQuantity + ' </p></li>');
            $('#show_unavailable').html('UNAVAIABLE ('+len+')');					
      	}
        
      	// after adding all the rows refresh the master list
      	$('#master_list_un_avialable').listview('refresh');
    }else{
      	//$('#master_list_un_avialable').empty();
      	console.log('all are available');
    }
}



// Transaction error callback
function errorAU(err) {
    alert("errorAU ::--- Error processing SQL: "+err);
}



















/******************************** DB ENDS ************************************/





var s_nameArray = [];
var s_latArray=[];
var s_longArray=[];
var s_addrArray= [];
var urlArray = [];
var s_distanceArray = [];




function makeURLToGetLatLongOfAllStores() {
    
    
    
	urlArray = [];
	s_nameArray = [];
	s_addrArray = [];
	s_latArray=[];
	s_longArray=[];
	s_distanceArray = [];
    
	console.log('makeURLToGetLatLongOfAllStores');
    
	console.log(' IN FUNC storesNameAtParticularZipcode.length ==== '+ storesNameAtParticularZipcode.length);
    
	for ( var i = 0; i < storesNameAtParticularZipcode.length; i++) {
        
		var storeNameForLatAndLong = storesNameAtParticularZipcode[i];
		var storeCityForLatAndLong = storesCityNameAtZipcode[i];
		var storeAddressForLatAndLong = storesAddressAtParticularZipcode[i];
        
		var urlForLatAndLong = 'http://maps.googleapis.com/maps/geo?output=json&q='
        + storeNameForLatAndLong + storeAddressForLatAndLong
        + storeCityForLatAndLong;
        
		console.log('urlForLatAndLong === '+ i +'-------------->>>>  '+urlForLatAndLong);
        
		
		urlArray.push(urlForLatAndLong);
		s_nameArray.push(storeNameForLatAndLong);
		s_addrArray.push(storeAddressForLatAndLong);
	}
    
    
	console.log("URL Length ==== "+urlArray.length);
	for(var i=0;i<urlArray.length;i++){
        
		console.log("URL ...........................................>>>>   ====="+urlArray[i]);
		console.log("NAME ...........................................>>>>   ====="+s_nameArray[i]);
		console.log("ADDR ...........................................>>>>   ====="+s_addrArray[i]);
        
	}
    
    
	// calling function....
	getLatAndLongFromUrl();
    
    
}




var xmlHttpForLatAndLongOfStore = new XMLHttpRequest();

function addLatLongs(){
    
	if (xmlHttpForLatAndLongOfStore.readyState == 4
        && xmlHttpForLatAndLongOfStore.status == 200) {	
        
        
		var xmlDocForZipcode = xmlHttpForLatAndLongOfStore.responseText;
		console.log("RESPONSE TXT TO GET THE LAT LONG ====  "+xmlDocForZipcode);
        
		var parsedString = JSON.parse(xmlDocForZipcode);
        
        
		console.log('parsedString.Status.code == '+parsedString.Status.code);
        
		if(parsedString.Status.code==200){
            
			console.log(" Latitude ===== "    + parsedString.Placemark[0].Point.coordinates[1]);
			console.log(" Longitude =====  "    + parsedString.Placemark[0].Point.coordinates[0]);
            
			
			s_latArray.push(parsedString.Placemark[0].Point.coordinates[1]);
			s_longArray.push(parsedString.Placemark[0].Point.coordinates[0]);
            
		}else{
            alert('no lat long in the response for this store');
		}
	}
}

xmlHttpForLatAndLongOfStore.onreadystatechange=addLatLongs;




function getLatAndLongFromUrl() {
	
	console.log('getLatAndLongFromUrl');
	
	console.log("URL Length getLatAndLongFromUrl ==== "+urlArray.length);
    
	for(var i=0;i<urlArray.length;i++){
        
		console.log("URL to which the query will be made ................getLatAndLongFromUrl...........................>>>>   ====="+urlArray[i]);
        
		xmlHttpForLatAndLongOfStore.open("POST", urlArray[i], false);
        
		xmlHttpForLatAndLongOfStore.send();
        
	} // for loop
    
	// display on console
	for(var i=0;i<s_latArray.length;i++)	{
		console.log("LAT getLatAndLongFromUrl.>>>>  "+s_latArray[i]);
		console.log("LONG getLatAndLongFromUrl>>>>  "+s_longArray[i]);
	}
    
    
    
	getTheDistanceTillStore();
    
    
	for(var i=0;i<s_distanceArray.length;i++){
		console.log("DISTANCE are === "+i+"---->"+s_distanceArray[i]);
	}
    
	
    
	// construct the product array first....
	constructProductArray();
    
	// following are called in the query success
    
	// productAvailableAtStoreUsingStoreID();
    
	// alert('will call displayMarkers()');
	// // calling function .......
	// displayMarkers();
    
}



var xmlHttpForDistanceToStore = new XMLHttpRequest();



function getDistance(){
    
    if(xmlHttpForDistanceToStore.readyState==4 && xmlHttpForDistanceToStore.status==200){
        
        
        var xmlToParseForDistance = xmlHttpForDistanceToStore.responseText;
        var parsedString = JSON.parse(xmlToParseForDistance);
        
        console.log("DISTANCE === :"+parsedString.routes[0].legs[0].distance.text);
        
        s_distanceArray.push(parsedString.routes[0].legs[0].distance.text);
    }
}

xmlHttpForDistanceToStore.onreadystatechange=getDistance;

function getTheDistanceTillStore(){
    
	for(var i=0;i<s_latArray.length;i++){
        
		var urlForCalculatingDistance = "http://maps.googleapis.com/maps/api/directions/json?origin=37.3970,-122.4183&destination="+s_latArray[i]+","+s_longArray[i]+"&sensor=false&mode=driving";
    	console.log(" urlForCalculatingDistance >>>>"+i+"<<<<  ==="+urlForCalculatingDistance);
        
        
    	xmlHttpForDistanceToStore.open("POST",urlForCalculatingDistance,false);              
	    xmlHttpForDistanceToStore.send();
    	
	}    
}










var arrayStoreItemName = new Array();
var arrayStoreItemCategory = new Array();
var arrayStoreItemId = new Array();
var arrayStoreItemImage = new Array();
var arrayStoreItemAsile = new Array();
var arrayAvailable = new Array();

var unAvailableProductNameArray = new Array();

var total_available=0;
var xmlhttpAvailability=new XMLHttpRequest();

function availablityCheck() {
    
    if (xmlhttpAvailability.readyState == 4 && xmlhttpAvailability.status == 200) {
		
        
        
        var store_index = window.localStorage.getItem("store_index");
        var current_store = 'STORE_'+s_storeIdArray[store_index];
        console.log('CURRENT STORE FULL NAME =='+current_store);
        
        window.localStorage.setItem("current_store_name",current_store);
        
        
        var xmlDoc = xmlhttpAvailability.responseXML;
        console.log("RESPONSE for availablityCheck === "+xmlDoc);
        
        
        var item_name = xmlDoc.getElementsByTagName("Itemname")[0].childNodes[0].nodeValue;
        var item_category = xmlDoc.getElementsByTagName("ItemCategory")[0].childNodes[0].nodeValue;;
        var item_id = xmlDoc.getElementsByTagName("ItemID")[0].childNodes[0].nodeValue;;
        var item_image = xmlDoc.getElementsByTagName("ItemImage")[0].childNodes[0].nodeValue;;
        var item_asile = xmlDoc.getElementsByTagName("AisleNumber")[0].childNodes[0].nodeValue;;
        
        //var itemName= items[0].childNodes[0].nodeValue;
        
        
        if(item_name == 'NOITEM')
        {
            
            // not avaiable 
            // insert into storeID (Table) values (NOT AVAIABLE,name,des,image,asile,)
            var product_name=window.localStorage.getItem("product_name");
            console.log(product_name +' NOT avaiable at store '+store_index);
            
            arrayStoreItemName.push(product_name);
            arrayStoreItemCategory.push('null');
            arrayStoreItemId.push('null');
            arrayStoreItemImage.push('null');
            arrayStoreItemAsile.push('null');
            arrayAvailable.push('no');
            
            unAvailableProductNameArray.push(product_name);
            
            
            // use the product name, and query rest of the details from LIST table and then update the store table
        }
        else{
            //callback(true,i);
            console.log('avaiable at store '+store_index)
            
            console.log('name of store=='+s_storeIdArray[store_index]);
            
            
            total_available++;                  
            // window.localStorage.setItem("total_available");
            //  var product_name=window.localStorage.getItem("product_name");
            
            
            arrayStoreItemName.push(item_name);
            arrayStoreItemCategory.push(item_category);
            arrayStoreItemId.push(item_id);
            arrayStoreItemImage.push(item_image);
            arrayStoreItemAsile.push(item_asile); 
            arrayAvailable.push('yes');
        }            
    }
}

xmlhttpAvailability.onreadystatechange = availablityCheck;


function checkAvailabilityAtURL(urlForCheckingAvailability,storeIndex,productName){
    
	console.log("URL for avaiable == "+urlForCheckingAvailability);
    
	console.log("sub func  store index=== "+storeIndex);
    
	window.localStorage.setItem("store_index",storeIndex);
	window.localStorage.setItem("product_name",productName);
    
    xmlhttpAvailability.open("GET",urlForCheckingAvailability,false);
    xmlhttpAvailability.send();
    
    
}

/******************* DATABASE to update the UN-AVAILABLE ITEMS *******************************/




var updateNameArray = new Array();
var updateCategoryArray = new Array();
var updateIDArray = new Array();
var updateURLArray = new Array();
var updateQuantityArray = new Array();

function getUnAvailableItemDetails(){
    
    console.log("getUnAvailableItemDetails()");
    
    
    updateNameArray = [];
    updateCategoryArray = [];
    updateIDArray = [];
    updateURLArray = [];
    updateQuantityArray = [];
    
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(querygetUnAvailableItemDetails, errorUnavailable);
}


function querygetUnAvailableItemDetails(tx) {
    
    console.log("querygetUnAvailableItemDetails(tx)");
    
    // get the title of the list
    var current_title = window.localStorage.getItem("title_of_list");
    
    for(var i=0;i<unAvailableProductNameArray.length;i++){
        
        var queryStatementForUnAvailableItemDetails = 'SELECT listItemName, listItemCategory, listItemID, listItemImage, listQuantity FROM '+current_title+' WHERE listItemName = "'+unAvailableProductNameArray[i]+'";';
        console.log('queryStatementForUnAvailableItemDetails --> '+queryStatementForUnAvailableItemDetails);
        tx.executeSql(queryStatementForUnAvailableItemDetails, [], unAvailableItemDetailsSuccess, errorUnavailable);
    }
    
    
    
}



function unAvailableItemDetailsSuccess(tx, results) {
    console.log("unAvailableItemDetailsSuccess");
    
    
    
    var len = results.rows.length;
    console.log('will be 1 otherwise same item more than once result len == '+len);
    
    for(var i=0;i<len;i++){
        
        updateNameArray.push(results.rows.item(0).listItemName);
        updateCategoryArray.push(results.rows.item(0).listItemCategory);
        updateIDArray.push(results.rows.item(0).listItemID);
        updateURLArray.push(results.rows.item(0).listItemImage);
        updateQuantityArray.push(results.rows.item(0).listQuantity);
        
        console.log('FOR LOOP At index >>> '+i+' <<< NAME = '+updateNameArray[i]);
        console.log('FOR LOOP At index >>> '+i+' <<< category = '+updateCategoryArray[i]);
        console.log('FOR LOOP At index >>> '+i+' <<< ID = '+updateIDArray[i]);
        console.log('FOR LOOP At index >>> '+i+' <<< URL = '+updateURLArray[i]);
        console.log('FOR LOOP At index >>> '+i+' <<< QTY = '+updateQuantityArray[i]);
        
        console.log('look at console.. passing the arrays');
        
        updateUnAvailableDetailsInStoreTable(updateNameArray,updateCategoryArray,updateIDArray,updateURLArray,updateQuantityArray);
        
    }
}




function updateUnAvailableDetailsInStoreTable(updateNameArray,updateCategoryArray,updateIDArray,updateURLArray,updateQuantityArray){
    console.log("Inside updateUnAvailableDetailsInStoreTable function... () ....");
    
    console.log('PRINTING THE UN - AVIALABLE DETAILS updateNameArray.length '+updateNameArray.length)
    for(var i=0;i<updateNameArray.length;i++){
        
        console.log('At index >>> '+i+' <<< NAME = '+updateNameArray[i]);
        console.log('At index >>> '+i+' <<< category = '+updateCategoryArray[i]);
        console.log('At index >>> '+i+' <<< ID = '+updateIDArray[i]);
        console.log('At index >>> '+i+' <<< URL = '+updateURLArray[i]);
        console.log('At index >>> '+i+' <<< QTY = '+updateQuantityArray[i]);
    }
    
    
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   for(var i=0;i<updateNameArray.length;i++){
                   
                   var store_name = window.localStorage.getItem("current_store_name");
                   var updateStatement = 'UPDATE '+store_name+'  SET storeItemCategory = ?, storeItemID = ?, storeItemImage = ? WHERE storeItemName = "'+updateNameArray[i]+'";';
                   console.log('updateStatement ='+updateStatement);
                   
                   tx.executeSql(updateStatement, [updateCategoryArray[i],updateIDArray[i],updateURLArray[i]],updationStoreSucess, errorUnavailable);
                   }
                   });
    
    
}


function updationStoreSucess(){
    console.log("Updation updationStoreSucess successfull.... :)");
}



// Transaction error callback
function errorUnavailable(err) {
    alert("errorUnavailable Error processing SQL: "+err);
}












/******************** DATABSE FOR UN_AVAILABLE ENDS ***************************************************/


/************************* query to construct product ARRAY ***********************************/

// open the corresponding list table

// get all the items in it SELECT *


var productArray = new Array();

function constructProductArray(){
    
	
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(queryDataFromList, errorInList);
}

function queryDataFromList(tx) {
    
    console.log("inside queryDataFromList(tx)");
    
    productArray = [];
    
    var table_name = window.localStorage.getItem("title_of_list");
    console.log('table which was queried == '+table_name);
    
    
    var queryListStatement = 'SELECT listItemName FROM '+table_name+';';
    console.log('queryListStatement == '+ queryListStatement);
    
    tx.executeSql(queryListStatement, [], queryListStatementSuccess, errorInList);
}



function queryListStatementSuccess(tx, results) {
    
    console.log("queryListStatementSuccess");
    
    var leng = results.rows.length;
    console.log('length has to be 1 == '+leng);
    
    
    
    for(var i=0;i<leng;i++){
        console.log('NAME = '+i+'---->'+results.rows.item(i).listItemName);
        
        productArray.push(results.rows.item(i).listItemName);
        
    }
    
    
    
	productAvailableAtStoreUsingStoreID();
    
    
    console.log('getUnAvailableItemDetails');
    getUnAvailableItemDetails();
    
	console.log('will call displayMarkers()');
	// calling function .......
	displayMarkers();
    
    
    
}



// Transaction error callback
function errorInList(err) {
    alert("errorInList ::--- Error processing SQL: "+err);
}








/************** product array query ENDS ********************************************************/




//var productArray = ['lyat','Gerber 100% Apple Juice - 32 Fl. Oz.','Gerber Apple Juice - 4-4 Fl. Oz.','Gerber Organic Apple Juice - 4-4 Fl. Oz.','Pedialyte Tetra/Brick Pk Apple Flavor - 4-6.8 Fl. Oz.','Gerber Finger Foods Fruit Wagon Wheels Apples - 1.48 Oz'];

//var storeIDArray = ['a995a35f8f','e6k3fjw215k'];


function productAvailableAtStoreUsingStoreID(){
    
    
    console.log('productArray.length = '+productArray.length);                        
    
    console.log('store array length = '+s_storeIdArray.length);
    
    for(var i= 0 ;i<s_storeIdArray.length;i++)
    {   
        
    	arrayStoreItemName = [];
		arrayStoreItemCategory = [];
		arrayStoreItemId = [];
		arrayStoreItemImage = [];
		arrayStoreItemAsile = [];
 		arrayAvailable = [];
 		total_available =0;
        
        unAvailableProductNameArray = [];
        
        
        for(var j=0; j<productArray.length; j++){
            
        	console.log('j loop = '+j+' times');
            
            var urlForCheckingAvailability = "http://www.supermarketapi.com/api.asmx/SearchForItem?APIKEY=93da6ed905&StoreId="+s_storeIdArray[i]+"&ItemName="+productArray[j];
            console.log("urlForCheckingAvailability == "+urlForCheckingAvailability);
            
            checkAvailabilityAtURL(urlForCheckingAvailability,i,productArray[j]);
            
        }
        
        console.log('inserting at '+s_storeIdArray[i]);
        
        insertRecordInStore(s_storeIdArray[i], arrayStoreItemName  , arrayStoreItemCategory, arrayStoreItemId,  arrayStoreItemImage,arrayStoreItemAsile, '1',arrayAvailable);
		
		var percent=((total_available/productArray.length)*100);
		percent = parseInt(percent);
        
		var totalItems = s_storeIdArray[i]+'total';
        
		window.localStorage.setItem(s_storeIdArray[i],percent);
		window.localStorage.setItem(totalItems,total_available);
        
        
        
    }
    
}






function displayMarkers(){
    
    
    
	var marker, infoBubble;
	var pinImage = 'images/pin.png';
	var currentLocationImage = 'images/dot.png';
    
    
	// current location
	marker = new google.maps.Marker({
                                    position : new google.maps.LatLng(currentLat, currentLong),
                                    map : map,
                                    icon : currentLocationImage
                                    });
    
    
	// add all the other markers
    for (var i = 0; i < s_latArray.length; i++) {
        
        var marker99 = new google.maps.Marker(
                                              {
                                              map : map,
                                              position : new google.maps.LatLng(s_latArray[i],
                                                                                s_longArray[i]),
                                              draggable : false,
                                              icon:pinImage
                                              });
        
		infoBubble = new InfoBubble({
                                    map : map,
                                    padding : 0,
                                    backgroundColor : 'rgb(57,57,57)',
                                    borderRadius : 4,
                                    arrowSize : 10,
                                    borderWidth : 1,
                                    borderColor : '#2c2c2c',
                                    hideCloseButton : false,
                                    arrowStyle : 0
                                    });
        
		// associate each pin with a bubble
    	google.maps.event
        .addListener(
                     marker99,
                     'click',
                     (function(marker99, i) {
                      return function() {
                      console.log('CLICKED ON THE ==== '+i+'th PIN ......');
                      
                      infoBubble.open(map, marker99);
                      infoBubble
                      .setContent('<div class="overlay"><div class="bubble_box" onclick="bubbleClicked()"><p class="bubble_percent">'+ window.localStorage.getItem(s_storeIdArray[i])+'%</p><p class="bubble_items">'+window.localStorage.getItem(s_storeIdArray[i]+'total')+'/'+productArray.length+' ITEMS'+'</p></div><div class="bubble_data"><p  id="bubble_id" class="bubble_header">'+s_nameArray[i]+'</p><p class="bubble_miles"> '+s_distanceArray[i]+'les AWAY</p></div></div>');
                      
                      
                      window.localStorage.setItem("store_name",s_nameArray[i]);
                      window.localStorage.setItem("store_lat",s_latArray[i]);
                      window.localStorage.setItem("store_long",s_longArray[i]);
                      window.localStorage.setItem("store_addr",s_addrArray[i]);
                      window.localStorage.setItem("store_miles",s_distanceArray[i]);
                      
                      window.localStorage.setItem("store_id",s_storeIdArray[i]);
                      
                      
                      var totalItems = s_storeIdArray[i]+'total';																		
                      var s_items = window.localStorage.getItem(totalItems)+'/'+productArray.length+' ITEMS';
                      
                      var s_percent = window.localStorage.getItem(s_storeIdArray[i])+'%';
                      
                      
                      
                      window.localStorage.setItem("store_items",s_items);
                      window.localStorage.setItem("store_percent",s_percent);
                      
                      
                      }
                      })(marker99, i));
        
        
        
    }// end of for loop
    
    
    $.mobile.hidePageLoadingMsg();
    
    
}






function bubbleClicked(){
	
	var name=$('#bubble_id').text();
	console.log(name);
    
    
    
	console.log("STORE NAME ---->"+window.localStorage.getItem("store_name"));
	console.log("STORE Latitude ---->"+window.localStorage.getItem("store_lat"));
	console.log("STORE Longitude ---->"+window.localStorage.getItem("store_long"));
	console.log("STORE ADDRESS ---->"+window.localStorage.getItem("store_addr"));
    
    
	
	$.mobile.changePage('#six');
}



/****** PAGE 6 *****************/

var map2;
$( '#six' ).bind( "pageshow", function(){
                 
                 console.log("PAGE 6 loaded.....");
                 
                 console.log("STORE NAME ---->"+window.localStorage.getItem("store_name"));
                 console.log("STORE Latitude ---->"+window.localStorage.getItem("store_lat"));
                 console.log("STORE Longitude ---->"+window.localStorage.getItem("store_long"));
                 console.log("STORE ADDRESS ---->"+window.localStorage.getItem("store_addr"));
                 
                 
                 var mapOptions2 = {
                 center: new google.maps.LatLng(window.localStorage.getItem("store_lat"), window.localStorage.getItem("store_long")),
                 zoom: 16,
                 mapTypeId: google.maps.MapTypeId.ROADMAP
                 };
                 
                 map2 = new google.maps.Map(document.getElementById('mapBackground'),mapOptions2);
                 
                 var marker2 = new google.maps.Marker(
                                                      {
                                                      map : map2,
                                                      position : new google.maps.LatLng(window.localStorage.getItem("store_lat"), window.localStorage.getItem("store_long")),
                                                      draggable : false,
                                                      // icon:pinImage
                                                      });
                 
                 
                 // set title bar name as the name of the store
                 $('#label_store').html(window.localStorage.getItem("store_name"));
                 
                 // set the name , address and other details
                 $('#id_store_name').html(window.localStorage.getItem("store_name"));
                 $('#id_store_address').html(window.localStorage.getItem("store_addr"));
                 $('#id_store_miles').html(window.localStorage.getItem("store_miles"));
                 $('#id_percentage').html(window.localStorage.getItem("store_percent"));
                 $('#id_total_items').html(window.localStorage.getItem("store_items"));
                 });




// function to change the directions pic on mouse over
$(function() {
  $("#id_bottomLinkDirections")
  .mouseover(function() { 
             $(this).attr('src',"images/directions_pressed.png");
             })
  .mouseout(function() {
            $(this).attr('src',"images/directions.png");
            })
  .click(function(){
         
         var googleUrl = "http://maps.google.com/maps?saddr=37.771068,-122.407402&daddr=" + window.localStorage.getItem("store_lat") + "," + window.localStorage.getItem("store_long");
         console.log(googleUrl);
         
         $('#id_link_map').attr('href',googleUrl);
         
         });
  });



$('#id_percent_box').click(function(){
                           
                           
                           
                           // get the store ID
                           var store_id = window.localStorage.getItem("store_id")
                           
                           
                           console.log('goto avaiable/un-available, moving to page 7 page STORE ID =='+store_id);
                           
                           
                           $.mobile.changePage('#seven');
                           
                           
                           });




// function to change the checkin pic on mouse over
$(function() {
  $("#id_bottomLinkCheckin")
  .mouseover(function() { 
             $(this).attr('src',"images/checkin_pressed.png");
             })
  .mouseout(function() {
            $(this).attr('src',"images/checkin.png");
            })
  .click(function(){
         
         $.mobile.changePage('#eight');
         
         
         
         
         
         });
  });







$( '#eight' ).bind( "pageshow", function(){
                   
                   console.log("PAGE 8 loaded.....");
                   
                   for(var i=0;i<arrayStoreItemAsile.length;i++){
                   
                   console.log('arrayStoreItemAsile ['+i+'] =='+arrayStoreItemAsile[i]);
                   }
                   
                   
                   removeClickListeners();
                   // tackle back otherwise PROBLEMS
                   highlightTheImage();
                   });




function removeClickListeners(){
    
    $('#asile1').unbind('click');
    $('#asile2').unbind('click');
    $('#asile3').unbind('click');
    $('#asile4').unbind('click');
    $('#asile5').unbind('click');
    $('#asile6').unbind('click');
    $('#asile7').unbind('click');
    $('#asile8').unbind('click');
    $('#asile9').unbind('click');
    $('#asile10').unbind('click');
    $('#asile11').unbind('click');
    $('#asile12').unbind('click');
    $('#asile13').unbind('click');
    $('#asile14').unbind('click');
    $('#asile15').unbind('click');
    $('#asile16').unbind('click');
    $('#asile17').unbind('click');
    $('#asile18').unbind('click');
    $('#asile19').unbind('click');
    $('#asile20').unbind('click');
    $('#asileBack').unbind('click');
    $('#asileFront').unbind('click');
    $('#asileLeft').unbind('click');
    $('#asileRight').unbind('click');
    
    
    
    
    
    
}





function highlightTheImage(){
    
    
    
    //function that returns unique value of array.
    
    var uniqueAisleNumberArray =arrayStoreItemAsile.filter(function(itm,i,arrayStoreItemAsile){
                                                           return i==arrayStoreItemAsile.indexOf(itm);
                                                           });
    
    for(var i=0;i<uniqueAisleNumberArray.length;i++){
    	console.log("UNIQUE ITEM AT "+i+"  IS ---->"+uniqueAisleNumberArray[i]);
    }
    
    for(var i = 0;i < uniqueAisleNumberArray.length; i++){
        
        var checkForAisleNumberForImageChange = uniqueAisleNumberArray[i];
        
        if(checkForAisleNumberForImageChange == "Aisle:1"){
            // change image at position 1;
            $('#asile1').attr('src',"images/aisle.png");
            
            $('#asile1').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:2"){
            // change image at position 2;
            $('#asile2').attr('src',"images/aisle.png");
            
            $('#asile2').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:3"){
            // change image at position 3;
            $('#asile3').attr('src',"images/aisle.png");
            
            $('#asile3').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:4"){
            // change image at position 4;
            $('#asile4').attr('src',"images/aisle.png");
            
            $('#asile4').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:5"){
            // change image at position 5;
            $('#asile5').attr('src',"images/aisle.png");
            
            $('#asile5').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:6"){
            // change image at position 6;
            $('#asile6').attr('src',"images/aisle.png");
            
            $('#asile6').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:7"){
            // change image at position 7;
            $('#asile7').attr('src',"images/aisle.png");
            
            $('#asile7').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:8"){
            // change image at position 8;
            $('#asile8').attr('src',"images/aisle.png");
            
            $('#asile8').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:9"){
            // change image at position 9;
            $('#asile9').attr('src',"images/aisle.png");
            
            $('#asile9').click(function(){
                               $.mobile.changePage('#nine');
                               });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:10"){
            // change image at position 10;
            $('#asile10').attr('src',"images/aisle.png");
            
            $('#asile10').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:11"){
            // change image at position 11;
            $('#asile11').attr('src',"images/aisle.png");
            
            $('#asile11').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:12"){
            // change image at position 12;
            $('#asile12').attr('src',"images/aisle.png");
            
            $('#asile12').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:13"){
            // change image at position 13;
            $('#asile13').attr('src',"images/aisle.png");
            
            $('#asile13').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:14"){
            // change image at position 14;
            $('#asile14').attr('src',"images/aisle.png");
            
            $('#asile14').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:15"){
            // change image at position 15;
            $('#asile15').attr('src',"images/aisle.png");
            
            $('#asile15').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:16"){
            // change image at position 16;
            $('#asile16').attr('src',"images/aisle.png");
            
            $('#asile16').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:17"){
            // change image at position 17;
            $('#asile17').attr('src',"images/aisle.png");
            
            $('#asile17').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:18"){
            // change image at position 18;
            $('#asile18').attr('src',"images/aisle.png");
            
            $('#asile18').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:19"){
            // change image at position 19;
            $('#asile19').attr('src',"images/aisle.png");
            
            $('#asile19').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:20"){
            // change image at position 20;
            $('#asile20').attr('src',"images/aisle.png");
            
            $('#asile20').click(function(){
                                $.mobile.changePage('#nine');
                                });
        }
        
        
        // top down left right
        
        if(checkForAisleNumberForImageChange == "Aisle:Right" || checkForAisleNumberForImageChange == "Aisle:NOAISLE" || checkForAisleNumberForImageChange == "Aisle:Right Center"){
            // change image at position right;
            $('#asileRight').attr('src',"images/right_active.png");
            
            $('#asileRight').click(function(){
                                   $.mobile.changePage('#nine');
                                   });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:Left" || checkForAisleNumberForImageChange == "Aisle:Left Center"){
            // change image at position left;
            $('#asileLeft').attr('src',"images/left_active.png");
            
            $('#asileLeft').click(function(){
                                  $.mobile.changePage('#nine');
                                  });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:Front" || checkForAisleNumberForImageChange == "Aisle:Front Right" || checkForAisleNumberForImageChange == "Aisle:Front Left"){
            // change image at position top;
            $('#asileFront').attr('src',"images/front_active.png");
            
            $('#asileFront').click(function(){
                                   $.mobile.changePage('#nine');
                                   });
        }
        
        if(checkForAisleNumberForImageChange == "Aisle:Back" || checkForAisleNumberForImageChange == "Aisle:Back Right" || checkForAisleNumberForImageChange == "Aisle:Back Left"){
            // change image at position down;
            $('#asileBack').attr('src',"images/back_active.png");
            
            $('#asileBack').click(function(){
                                  $.mobile.changePage('#nine');
                                  });
        }
    }// for loop
}















/******************** PAGE 7 ***************************/

$( '#seven' ).bind( "pageshow", function(){
                   
                   console.log("PAGE 7 loaded.....");
                   
                   // get the store ID
                   var store_id = window.localStorage.getItem("store_id")
                   
                   //getAvailableItems(store_id);
                   
                   
                   getAllCategoriesFromStoreTable();
                   });















// tab switching



//function to toggle the tabs map vs list view
$(function(){
  
  $('#show_map').click(function(){
                       
                       
                       
                       $('#show_map').removeClass("normal");
                       $('#show_map').addClass("selected");
                       $('#show_list').removeClass("selected");
                       $('#show_list').addClass("normal");
                       
                       
                       
                       $('#map_list_view').css('display','none');
                       $('#map_canvas').css('display','block');
                       
                       });
  
  $('#show_list').click(function(){
                        
                        
                        $('#show_map').removeClass("selected");
                        $('#show_map').addClass("normal");
                        $('#show_list').removeClass("normal");
                        $('#show_list').addClass("selected");
                        
                        $('#map_canvas').css('display','none');
                        $('#map_list_view').css('display','inline');
                        
                        
                        
                        // inflate the list properly
                        
                        $('#map_listview').empty();
                        
                        for(var i=0;i<s_storeIdArray.length;i++){
                        $('#map_listview').append('<li class="custom_listview_img_listview"><div id="id_percent_box_listview" class="store_small_box_listview"><p id="id_percentage_listview" class="store_percent_listview">'+window.localStorage.getItem(s_storeIdArray[i])+'%</p><p id="id_total_items_listview" class="store_total_items_listview">'+window.localStorage.getItem(s_storeIdArray[i]+'total')+'/'+productArray.length+' ITEMS</p></div><div class="right_side_listview"><p id="click_row" class="name_listview">'+s_nameArray[i]+'</p><p class="miles_listview">'+s_distanceArray[i]+'les away</p><h6 id="index_id" style="display:none;">'+i+'</h6></div></li>');
                        }  
                        
                        $('#map_listview').listview('refresh');
                        
                        });
  });


$('#click_row').live('click',function(){
                     
                     var i=$(this).siblings('h6').text();
                     i = parseInt(i);
                     
                     window.localStorage.setItem("store_name",s_nameArray[i]);
                     window.localStorage.setItem("store_lat",s_latArray[i]);
                     window.localStorage.setItem("store_long",s_longArray[i]);
                     window.localStorage.setItem("store_addr",s_addrArray[i]);
                     window.localStorage.setItem("store_miles",s_distanceArray[i]);
                     
                     var totalItems = s_storeIdArray[i]+'total';																		
                     var s_items = window.localStorage.getItem(totalItems)+'/'+productArray.length+' ITEMS';
                     
                     var s_percent = window.localStorage.getItem(s_storeIdArray[i])+'%';
                     
                     window.localStorage.setItem("store_items",s_items);
                     window.localStorage.setItem("store_percent",s_percent);
                     
                     
                     window.localStorage.setItem("store_id",s_storeIdArray[i]);
                     
                     $.mobile.changePage('#six');
                     
                     });




/***** Page #7 **************/


//function to toggle the tabs map vs list view
$(function(){
  
  $('#show_available').click(function(){
                             
                             
                             
                             $('#show_available').removeClass("normal");
                             $('#show_available').addClass("selected");
                             
                             $('#show_unavailable').removeClass("selected");
                             $('#show_unavailable').addClass("normal");
                             
                             
                             
                             $('#list_show_unavailable').css('display','none');
                             $('#list_show_available').css('display','inline');
                             
                             
                             
                             });
  
  $('#show_unavailable').click(function(){
                               
                               
                               $('#show_available').removeClass("selected");
                               $('#show_available').addClass("normal");
                               
                               $('#show_unavailable').removeClass("normal");
                               $('#show_unavailable').addClass("selected");
                               
                               $('#list_show_available').css('display','none');
                               $('#list_show_unavailable').css('display','inline');
                               
                               
                               });
  });




