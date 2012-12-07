// Author :- Aamir Shah


/* Every time the document is loaded this function is called
 The purpose of the function is to check whether any list is present in the data base
 or not.
 
 Count specifies the total number of lists in the Data base.
 */
$(document).ready(function(){
                  
                  console.log("DOM loaded...");
                  
                  var count = window.localStorage.getItem("count"); 
                  console.log('Total number of lists in the database ='+count);
                  
                  // show proper UI image or list-view
                  if(count==0 || count==null){
                  $('#list').css('display','none');
                  $('#noList').css('display','block');
                  }else{
                  $('#list').css('display','inline');
                  $('#noList').css('display','none');
                  }
                  
                  
                  onDeviceReady();
                  
                  /*
                   Every time the home page is loaded check the database, and
                   accordingly show the list-view
                   */
                  $( '#homepage' ).bind( "pageshow", function(){
                                        console.log('see the console !');
                                        
                                        // EVRY TIME WE COME BACK TO HOME SCREEN
                                        var firstrun = window.localStorage.getItem("flag"); 
                                        
                                        if ( firstrun == null ) {
                                        console.log("No DB as of now");
                                        }
                                        
                                        else {
                                        console.log("Updated values are :- ");
                                        
                                        // initially clear the UI      
                                        $('#id_ul').empty();
                                        
                                        // query the database to get the latest values.
                                        var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
                                        db.transaction(queryDB, errorCB);
                                        
                                        
                                        /*
                                         count is stored in the html5 local storage
                                         count is the total number of entries in the database.
                                         */
                                        var count = window.localStorage.getItem("count"); 
                                        console.log('Count  == ' + count);
                                        
                                        if(count==0 || count==null){
                                        $('#list').css('display','none');
                                        $('#noList').css('display','block');
                                        }else{
                                        $('#list').css('display','inline');
                                        $('#noList').css('display','none');
                                        }
                                        }  
                                        });
                  });

/*  
 The function checks whether this is the first run of the program
 or not. If it is a first run, then we create the database.
 */
function onDeviceReady() {
    
    console.log("onDeviceReady()");
    
    // check for the first run...
    var firstrun = window.localStorage.getItem("flag"); 
    
    // if first run create the data base.
    if ( firstrun == null ) {
        console.log("this is the first run");
        window.localStorage.setItem("flag", "1"); 
        
        var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
        db.transaction(populateDB, errorCB, successCB);
        
    }
    // else query the database to update the UI (list-view)
    else {
        console.log("Subsequent Runs....");
        
        var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
        db.transaction(queryDB, errorCB);
    }    
}

// function to show and hide the loading screen

function showLoading(){
    $("body").append('<div class="modalWindow"/>');
    $.mobile.showPageLoadingMsg();
}

function hideLoading(){
    $(".modalWindow").remove();
    $.mobile.hidePageLoadingMsg();
}


/****************************************************** DATABASE *******************************************************************/
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PIN POINT TABLE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

// Create the database (Populate the database)
function populateDB(tx) {
    
    console.log("populateDB()");
    
    tx.executeSql('DROP TABLE IF EXISTS PIN_POINT');
    tx.executeSql('CREATE TABLE IF NOT EXISTS PIN_POINT (id integer primary key autoincrement, name , total_items , upload_time )');
}

// Transaction error callback
function errorCB(err) {
    alert("Error processing SQL: "+err);
}

// Transaction success callback
function successCB() {
    
    console.log("populateDB SUCCESS");        
    
    // zero because initially the table is empty
    window.localStorage.setItem("count", "0"); 
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(queryDB, errorCB);
}


// get every thing from the PIN_POINT table
function queryDB(tx) {
    
    console.log("Simply querrying");
    tx.executeSql('SELECT * FROM PIN_POINT', [], querySuccess, errorCB);
}


// Query the success callback,
// display the results on the console and update the UI (list-view)
function querySuccess(tx, results) {
    
    console.log("querySuccess");
    
    var len = results.rows.length;
    
    db_row_count=len;
    
    console.log("PIN_POINT table: " + len + " rows found.");
    
    for (var i=0; i<len; i++){
        
        //alert(results.rows.item(i).total_items);
        
        
        console.log( " Row = " + i + " ID = " + results.rows.item(i).id 
                    + " NAME =  "              + results.rows.item(i).name +
                    + " total_items =  "       + results.rows.item(i).total_items
                    + " upload_time =  "       + results.rows.item(i).upload_time);
        
        var name_without_ = results.rows.item(i).name;
        if(name_without_.indexOf('_') > -1){
            // there is a space
            // replace all spaces with _    	
            name_without_ = name_without_.replace(/_/g, ' ');
        }
        
        // inflate the list view 
        $('#id_ul').append('<li id="main_full_row" class="custom_listview_img"> <h1 class="list_title" id="list_title">'+ name_without_ +'</h1><p class="list_items">'+ results.rows.item(i).total_items +' ITEMS. </p> <p class="list_time">UPDATED :- '+results.rows.item(i).upload_time+'</p><img  id="deleteMe" style="margin-left: 275px; margin-top: 49px;" src="images/curl.png" /></li>');
    }
    
    // refresh the listview
    $('#id_ul').listview('refresh');
} 


// inserting into the database
function insertRecord(name,total_items,upload_time) {
    console.log("Inserting into DB ....");
    
    
    var insertStatement = "INSERT INTO PIN_POINT (name, total_items, upload_time) VALUES (?, ?,?)";
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   tx.executeSql(insertStatement, [name,total_items,upload_time],insertedSucess, errorCB);
                   });
}





function updateTotalItems(list_name,items_count){
    console.log("Inside update function... () ....");
    
    
    // fetch the current date
    var d = new Date();
    var month = d.getMonth()+1;
    var day = d.getDate();
    
    // date in the format of year/month/day
    var updated_time = d.getFullYear() + '/' + ((''+month).length<2 ? '0' : '') + month + '/' + ((''+day).length<2 ? '0' : '') + day;
    
    
    
    var updateStatement = 'UPDATE PIN_POINT SET total_items = ?, upload_time = ? WHERE name = "'+list_name+'";';
    console.log('updateStatement ='+updateStatement);
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   tx.executeSql(updateStatement, [items_count,updated_time],updationSucess, errorCB);
                   });
    
    
}


function getItemCountFromList(){
    
    console.log("getItemCountFromList()");
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    
    console.log("getItemCountFromList() starting transaction....");
    db.transaction(queryForItems, errorCB);
}


function queryForItems(tx) {
    
    console.log("queryForItems(tx)");
    
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryItemsSuccess, errorCB);
}


function queryItemsSuccess(tx, results) {
    console.log("queryItemsSuccess");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    var len = results.rows.length;
    console.log('result len == '+len);
    
    var newItemCount = results.rows.item(0).total_items;
    
    console.log(' total_items =  '+ results.rows.item(0).total_items);
    
    newItemCount++;
    
    console.log(newItemCount);
    
    console.log("Calling updateTotalItems() .... ");
    updateTotalItems(list_title,newItemCount);
}


function updationSucess(){
    console.log("Updation successfull.... :)");
    
    
}


function insertedSucess(){
    console.log('Inserted Successfully...');
    var count = window.localStorage.getItem("count"); 
    //alert("before"+count);
    count++;
    //alert("after"+count);
    window.localStorage.setItem("count",count);
}


function deleteRecord(name){
    
    window.localStorage.setItem("table_to_be_dropped",name); 
    
    
    var deleteStatement = "DELETE FROM PIN_POINT WHERE name=?";
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    
    db.transaction(function(tx) {
                   tx.executeSql(deleteStatement, [name],deletionSucess, errorCB);
                   });
}

function deletionSucess(){
    
    var count = window.localStorage.getItem("count"); 
    //alert("before"+count);
    count--;
    //alert("after"+count);
    window.localStorage.setItem("count",count);
    
    console.log('deletionSucess... count=='+count);
    
    // show proper UI
    if(count==0 || count==null){
        $('#list').css('display','none');
        $('#noList').css('display','block');
    }else{
        $('#list').css('display','inline');
        $('#noList').css('display','none');
    }
    
    
    var tableName = window.localStorage.getItem("table_to_be_dropped"); 
    
    console.log("will drop table "+tableName);
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    var dropTableStatement = "DROP TABLE IF EXISTS "+tableName;
    
    db.transaction(function(tx) {
                   tx.executeSql(dropTableStatement, [],droppingSucess, errorCB);
                   });
    
}


function droppingSucess(){
    console.log("Table was DROPPED Successfully............................................ !@#$%^&*()");
}

/****************************************************** DATABASE - ENDS *******************************************************************/
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/ 





/********************************* DATABASE  *****************************************************************/
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> BUFFER TABLE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/



function bufferData(){
    console.log("inside bufferData() !!!!");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(tempPopulate, tempError, tempSuccess);
}

// Create the database (Populate the database)
function tempPopulate(tx) {
    
    console.log("temp populate()");
    
    tx.executeSql('DROP TABLE IF EXISTS BUFFER');
    console.log("will create buffer table");
    tx.executeSql('CREATE TABLE IF NOT EXISTS BUFFER (id integer primary key autoincrement, arrayItemName  , arrayItemCategory, arrayItemID,  arrayItemImage, arrayAisleNumber)');
    console.log("buffer table is created...");
}

// Transaction error callback
function tempError(err) {
    alert("temp Error processing SQL: "+err);
}

// Transaction success callback
function tempSuccess() {
    console.log("temp populateDB SUCCESS");        
}

// inserting into the database
function insertBufferRecords(arrayItemName , arrayItemCategory, arrayItemID,  arrayItemImage, arrayAisleNumber) {
    
    console.log("inside insertBufferRecords() !!!!");
    
    
    var insertStatement = "INSERT INTO BUFFER (arrayItemName  , arrayItemCategory, arrayItemID,  arrayItemImage, arrayAisleNumber) VALUES (?,?,?,?,?)";
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   for (i=0;i<arrayItemName.length;i++){
                   tx.executeSql(insertStatement, [ arrayItemName[i].childNodes[0].nodeValue,arrayItemCategory[i].childNodes[0].nodeValue,arrayItemID[i].childNodes[0].nodeValue, arrayItemImage[i].childNodes[0].nodeValue,arrayAisleNumber[i].childNodes[0].nodeValue],insertedBufferSucess, tempError);
                   }
                   });
    
}

function insertedBufferSucess(){
    console.log("Item entered......");
}



function queryForCategories(){
    
    console.log("inside queryForCategories()...");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(queryCategories, errorCB);
}


function queryCategories(tx) {
    
    console.log("inside queryCategories(tx)");
    
    var queryCategoryStatement = 'SELECT distinct arrayItemCategory FROM BUFFER';
    tx.executeSql(queryCategoryStatement, [], queryCategorySuccess, errorCB);
}

// global 
var categoriesArray = new Array();

function queryCategorySuccess(tx, results) {
    
    // clear the array 
    categoriesArray = [];
    
    console.log("queryCategorySuccess");
    
    var len = results.rows.length;
    console.log('Total categories == '+len);
    
    
    $("#id_category").html('CATEGORIES ('+len+')');
    
    for(var i=0;i<len;i++){
        categoriesArray[i]=results.rows.item(i).arrayItemCategory;
        console.log('Category  --  '+i+'=='+results.rows.item(i).arrayItemCategory);
        
        $('#category_list_view').append('<li class="categories_major"><p class="search_category">'+results.rows.item(i).arrayItemCategory+'</p><img id="add_category_full" class="category_img_align" src="images/add_item_normal.png"></li>');
    }
    
    // after adding all the items refresh the list view.                                 
    $('#category_list_view').listview('refresh');     
    
    //$.mobile.hidePageLoadingMsg();
    hideLoading();
}




/***************************** DATA BASE .............. lists ................. *********************************************/
// Every time a list is created a corresponding TABLE will be associated with it.....
// we will be using this table later for processing the lists further.


function createListTable(){
    console.log("inside createListTable() !!!!");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(listPopulate, listError, listSuccess);
}




// Create the database (Populate the database)
function listPopulate(tx) {
    
    var table_name = window.localStorage.getItem("title_of_list");
    //alert('table to be created is ='+table_name);
    
    console.log("listPopulating.... listPopulate()");
    
    var dropListSQL = 'DROP TABLE IF EXISTS '+table_name;
    //alert('drop statement'+dropListSQL);
    console.log(dropListSQL);
    
    tx.executeSql(dropListSQL);
    
    var createListTableSQL = 'CREATE TABLE IF NOT EXISTS ' + table_name + '  (id integer primary key autoincrement, listItemName  , listItemCategory, listItemID,  listItemImage, listAisleNumber, listQuantity)';
    //alert(createListTableSQL);
    console.log(createListTableSQL);
    
    tx.executeSql(createListTableSQL);
    console.log("LIST  table is created...   :) ");
}


// Transaction error callback
function listError(err) {
    alert("listError::--- Error processing SQL: "+err);
}

// Transaction success callback
function listSuccess() {
    console.log("listSuccess  SUCCESS .............. ##################");   
    
    // re-direction is in HTML
    // initially nothing is there
    $('#search_list').css('display','none');
    $('#search_noList').css('display','block');     
}



/* **************************** QUERY FROM BUFFER TABLE ***************************************** */

function getItemDataFromBuffer(){
    
    console.log("inside getItemDataFromBuffer()...");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(queryItemDataFromBuffer, errorQueryBuffer);
}

function queryItemDataFromBuffer(tx) {
    
    console.log("inside queryItemDataFromBuffer(tx)");
    
    var key =   window.localStorage.getItem("key_name_for_query"); 
    console.log('key =='+key+"#");
    
    var queryItemDataFromBufferStatement = 'SELECT arrayItemName, arrayItemCategory, arrayItemID, arrayItemImage, arrayAisleNumber FROM BUFFER WHERE arrayItemName ="'+key+'"';
    console.log('queryItemDataFromBufferStatement == '+ queryItemDataFromBufferStatement);
    
    tx.executeSql(queryItemDataFromBufferStatement, [], queryItemDataFromBufferSuccess, errorQueryBuffer);
}



function queryItemDataFromBufferSuccess(tx, results) {
    
    console.log("queryCategorySuccess");
    
    var leng = results.rows.length;
    console.log('length has to be 1 == '+leng);
    
    
    
    for(var i=0;i<leng;i++){
        console.log('NAME = '+i+'---->'+results.rows.item(i).arrayItemName);
        console.log('CATEGORY = '+i+'---->'+results.rows.item(i).arrayItemCategory);
        console.log('ID = '+i+'---->'+results.rows.item(i).arrayItemID);
        console.log('URL = '+i+'---->'+results.rows.item(i).arrayItemImage);
        console.log('ASILE = '+i+'---->'+results.rows.item(i).arrayAisleNumber);
    }
    
    
    window.localStorage.setItem("list_name",results.rows.item(0).arrayItemName);
    window.localStorage.setItem("list_catgegory",results.rows.item(0).arrayItemCategory);
    window.localStorage.setItem("list_id",results.rows.item(0).arrayItemID);
    window.localStorage.setItem("list_url",results.rows.item(0).arrayItemImage);
    window.localStorage.setItem("list_asile",results.rows.item(0).arrayAisleNumber);
    
    // store the above values into the list table
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(storeIntoListTable, errorQueryBuffer);
    
}


function storeIntoListTable(tx) {
    
    // table name is same as the title of the list
    var table_name = window.localStorage.getItem("title_of_list");
    console.log('inserting into table  ='+table_name);
    console.log("inserting into list table....");
    
    
    var insertListStatement = 'INSERT INTO ' + table_name + ' (listItemName  , listItemCategory, listItemID,  listItemImage, listAisleNumber, listQuantity)  VALUES (?,?,?,?,?,?)';
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   // initially the quantity will be ONE
                   tx.executeSql(insertListStatement, [window.localStorage.getItem("list_name") , window.localStorage.getItem("list_catgegory") , window.localStorage.getItem("list_id") , window.localStorage.getItem("list_url"), window.localStorage.getItem("list_asile") , "1"],insertedListSucess, errorQueryBuffer);
                   
                   });
    
}


function insertedListSucess(){
    console.log("insertedListSucess......");
}


// Transaction error callback
function errorQueryBuffer(err) {
    alert("errorQueryBuffer ::--- Error processing SQL: "+err);
}


/**************************************** Buffer check for Category ****************************************************************/


function checkDataInBufferForCategory(){
    
    console.log("inside checkDataInBufferForCategory()...");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(getDataInBufferForCategory, errorCheckBuffer);
    
}


function getDataInBufferForCategory(tx) {
    
    console.log("inside getDataInBufferForCategory(tx)");
    
    var key_category =   window.localStorage.getItem("temp_catgeory");  
    console.log('key_category == '+key_category);
    
    var queryFromBufferForCategoryStatement = 'SELECT arrayItemName, arrayItemCategory, arrayItemID, arrayItemImage, arrayAisleNumber FROM BUFFER WHERE arrayItemCategory = "' + key_category + '"';
    console.log('queryFromBufferForCategoryStatement == '+ queryFromBufferForCategoryStatement);
    
    tx.executeSql(queryFromBufferForCategoryStatement, [], queryFromBufferForCategoryStatementSuccess, errorCheckBuffer);
}



// GLOBAL ARRAYS
var categoryItemName         = new Array();
var categoryItemCategory     = new Array();
var categoryItemID           = new Array();
var categoryItemImage        = new Array();
var categoryItemAsileNumber  = new Array();


function queryFromBufferForCategoryStatementSuccess(tx, results) {
    
    console.log("queryFromBufferForCategoryStatementSuccess....... !@#$%^&*()");
    
    // clear the previous data 
    categoryItemName        = [];
    categoryItemCategory    = [];
    categoryItemID          = [];
    categoryItemImage       = [];
    categoryItemAsileNumber = [];
    
    var category_length = results.rows.length;
    window.localStorage.setItem("category_length",category_length);
    
    console.log('length can be more than 1 == '+category_length);
    
    
    // save the results into the array
    for(var i=0;i<category_length;i++){
        categoryItemName.push(results.rows.item(i).arrayItemName);
        categoryItemCategory.push(results.rows.item(i).arrayItemCategory);
        categoryItemID.push(results.rows.item(i).arrayItemID);
        categoryItemImage.push(results.rows.item(i).arrayItemImage);
        categoryItemAsileNumber.push(results.rows.item(i).arrayAisleNumber);
    }
    
    
    // printing from the array
    for(var i=0;i<category_length;i++){
        console.log('NAME = '     +i+'---->'    +categoryItemName[i]);
        console.log('CATEGORY = ' +i+'---->'    +categoryItemCategory[i]);
        console.log('ID = '       +i+'---->'    +categoryItemID[i]);
        console.log('URL = '      +i+'---->'    +categoryItemImage[i]);
        console.log('ASILE = '    +i+'---->'    +categoryItemAsileNumber[i]);
        
    }
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(storeIntoListTableCategory, errorCheckBuffer);
}




function storeIntoListTableCategory(tx) {
    
    // table name is same as the title of the list
    var table_name = window.localStorage.getItem("title_of_list");
    console.log('inserting into table  ='+table_name);
    console.log("inserting into list table....");
    
    
    var insertListStatement = 'INSERT INTO ' + table_name + ' (listItemName  , listItemCategory, listItemID,  listItemImage, listAisleNumber, listQuantity)  VALUES (?,?,?,?,?,?)';
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    
    
    db.transaction(function(tx) 
                   {
                   
                   var loop_limit = window.localStorage.getItem("category_length");
                   
                   for(var i=0; i<loop_limit;i++ ){
                   // initially the quantity will be ONE
                   
                   tx.executeSql(insertListStatement, [categoryItemName[i] , categoryItemCategory[i] , categoryItemID[i] , categoryItemImage[i], categoryItemAsileNumber[i] , "1"],insertedListSucessCategory, errorQueryBuffer);
                   }
                   
                   });
    
}



function insertedListSucessCategory(){
    console.log("insertedListSucessCategory......");
}


/* ******************************************* BULK UPDATE FOR CATEGORY (updation of toal no. of items)****************************************************************************************/

function getBulkItemCountFromList(){
    
    
    console.log(" BULK getBulkItemCountFromList()");
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    
    
    db.transaction(queryForBulkItems, errorCB);
}


function queryForBulkItems(tx) {
    
    console.log("queryForBulkItems(tx)");
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryBulkItemsSuccess, errorCB);
}


function queryBulkItemsSuccess(tx, results) {
    console.log("queryBulkItemsSuccess");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    var bulk_item_length = results.rows.length;
    console.log('bulk_item_length == '+bulk_item_length);
    
    var newBulkItemCount = results.rows.item(0).total_items;
    console.log(' BEFORE total_items =  '+ results.rows.item(0).total_items);
    
    var counter = window.localStorage.getItem("category_length");
    newBulkItemCount = parseInt(newBulkItemCount) + parseInt(counter) ;
    console.log('AFTER '+newBulkItemCount);
    
    console.log("Calling updateTotalItems() .... ");
    updateTotalItems(list_title,newBulkItemCount);
    
}


// Transaction error callback
function errorCheckBuffer(err) {
    alert("errorCheckBuffer ::--- Error processing SQL: "+err);
}










/**************************************** List's Page ********************************************************************************************/





function getTotalItems(){
    // flush the previous thing
    $('#master_list').empty();
    
    console.log("getTotalItems()");
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(queryTotalItems, errorLists);
}


function queryTotalItems(tx) {
    
    console.log("queryTotalItems(tx)");
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryTotalItemsSuccess, errorLists);
}


function queryTotalItemsSuccess(tx, results) {
    
    console.log("queryTotalItemsSuccess");
    
    var list_title = window.localStorage.getItem("title_of_list");              
    var total_count = results.rows.item(0).total_items;
    
    console.log(' total_items =  '+ total_count);
    
    // show on UI
    $('#total_items_counter').html('Your list contains ' + total_count + ' items.');
    
    window.localStorage.setItem("before_find_store_count",total_count);
    if(total_count != 0){
        
        var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
        db.transaction(queryCategoriesInListTable, errorLists);
        
    }else{
        console.log('no items in the list');
        
    }
    
}



function queryCategoriesInListTable(tx) {
    
    console.log("queryCategoriesInListTable(tx)");
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    
    var queryCategoryInListTableStatement = 'SELECT distinct listItemCategory FROM "'+list_title+'"';
    tx.executeSql(queryCategoryInListTableStatement, [], queryCategoryInListTableSuccess, errorLists);
}




var bufferCategoriesOfList = new Array();

function queryCategoryInListTableSuccess(tx, results) {
    
    bufferCategoriesOfList = [];
    
    console.log("queryCategoryInListTableSuccess()...");
    
    var len = results.rows.length;
    console.log('Total categories == '+len);
    
    // buffer all the categories of that particular list
    for(var i=0;i<len;i++){
        bufferCategoriesOfList.push(results.rows.item(i).listItemCategory);
    }
    
    console.log('data buffered');
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(fetchSubList, errorLists);  
    
}





function fetchSubList(tx) {
    
    console.log("fetchSubList(tx)");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    console.log('bufferCategoriesOfList.length === ' + bufferCategoriesOfList.length);
    
    //        // clear the previous UI
    //        $('#master_list').empty();
    
    for(var i=0;i<bufferCategoriesOfList.length;i++){
        
        var fetchSubListStatement = 'SELECT listItemName, listItemCategory, listItemImage, listQuantity FROM "'+list_title+'" WHERE listItemCategory ="'+bufferCategoriesOfList[i]+'"';
        console.log('fetchSubListStatement == '+fetchSubListStatement);
        
        tx.executeSql(fetchSubListStatement, [], fetchSubListSuccess, errorLists);
    }
}


function fetchSubListSuccess(tx, results) {
    
    console.log("fetchSubListSuccess()...");
    
    var len = results.rows.length;
    console.log('Total Sub items in this list  == '+len);
    
    
    $('#master_list').append('<li class="categories_major"><p class="text_of_category">'+results.rows.item(0).listItemCategory+'</p><img id="category_full_delete" class="img_of_category" src="images/shopping_x_normal.png"></li>');
    
    for(var i=0;i<len;i++){                
        $('#master_list').append('<li id="master_click" class="custom_listview_img_edge"><h2 style="display:none">'+results.rows.item(0).listItemCategory+'</h2><img id="get_src" width="45" height="45" class="sub_category_img" src="'+results.rows.item(i).listItemImage+'" /><h6 class="sub_category_name">'+results.rows.item(i).listItemName+'</h6><h5 style="display:none">'+results.rows.item(i).listQuantity+'</h5><p class="sub_category_quantity"> QTY :-' + results.rows.item(i).listQuantity + ' </p><img id="catgeory_item_delete" class="sub_category_rightside" src="images/shopping_x_normal.png" /></li>');
    }
    
    
    
    // after adding all the rows refresh the master list
    $('#master_list').listview('refresh');           
}


/************************************* DYNAMIC DELETION CATEGORY WISE ************************************************************************************/
var temp_ref;
var temp_main_ref;
$('#master_click').live('click',function (){
                        
                        temp_main_ref = $(this);
                        $('#temp_view').remove();
                        
                        
                        
                        if(window.localStorage.getItem("open") == "open"){
                        // close
                        window.localStorage.setItem("open","close");
                        }else{
                        
                        
                        var cur_name=$(this).children('h6').text();
                        
                        var cur_qty=$(this).children('h5').text();
                        cur_qty = parseInt(cur_qty);
                        
                        var cur_url=$(this).children('#get_src').attr('src');
                        var cur_cat=$(this).children('h2').text();
                        
                        
                        temp_ref=$(this).children('.sub_category_quantity');
                        
                        // set bcoz of the definition of delete func
                        window.localStorage.setItem("item_to_be_dropped",cur_name);
                        
                        window.localStorage.setItem("cur_name",cur_name);	
                        window.localStorage.setItem("cur_cat",cur_cat);
                        window.localStorage.setItem("cur_url",cur_url);
                        window.localStorage.setItem("now",cur_qty);
                        
                        window.localStorage.setItem("open","open");
                        
                        $(this).after('<li id="temp_view" class="tempView"><div class="qty_box"><p class="temp_qty">QUANTITY</p><img id="dec" class="qty_less" src="images/quantity_less_normal.png" /><img class="qty_white_box" src="images/quantity_box.png" /><h3  id="qty_value" class="qty_qty">'+cur_qty+'</h3><img id="inc" class="qty_more" src="images/quantity_more_normal.png" /></div><div class="move_box"><img id="moving" class="move_to" src="images/move_to_row.png" /></div></li>');
                        
                        $('#master_list').listview('refresh');   
                        }
                        });


$('#dec').live('click',function(){
               var now = $(this).siblings('h3').text();
               now  = parseInt(now);
               now--;
               if(now<0){
               now=0;
               }
               $('#qty_value').html(now);
               window.localStorage.setItem("now",now); 
               
               // update the ui
               temp_ref.html('QTY :-'+now);
               
               // update the database
               updateQuantity();
               
               
               });

$('#inc').live('click',function(){
               var now = $(this).siblings('h3').text();
               now  = parseInt(now);
               now++;
               $('#qty_value').html(now);
               
               window.localStorage.setItem("now",now); 
               
               // udpate the ui
               temp_ref.html('QTY :-'+now);
               
               // update the database
               updateQuantity();	
               
               });


function updateQuantity(){
	
	
	var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(updateQuantityInListTable, errorQtyUpdation);
    
}



function updateQuantityInListTable(tx) {
    
    console.log("updateQuantityInListTable(tx)");
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    var list_name = window.localStorage.getItem("cur_name"); 
    var qty = window.localStorage.getItem("now"); 
    
    var updateQtyStatement = 'UPDATE '+list_title+' SET listQuantity = ? WHERE listItemName = "'+list_name+'";';
    console.log('updateQtyStatement ='+updateQtyStatement);
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   tx.executeSql(updateQtyStatement, [qty],updationQtySucessfull, errorQtyUpdation);
                   });
    
    
}
function updationQtySucessfull(){
    
    console.log('updationQtySucessfull()....... *****************************************');
}

//Transaction error callback
function errorQtyUpdation(err) {
    alert("errorQtyUpdation ::--- Error processing SQL: "+err);
}



$('#moving').live('click',function(){
                  //	alert('move to');
                  
                  getCurrentLists();
                  
                  // fetch the total list det
                  $( '#popupMenu' ).popup();		
                  $('#popupMenu').popup('open');
                  });


function getCurrentLists(){
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(getCurrentListsQuery, errorCurrentLists);
}

function getCurrentListsQuery(tx){
    
    
    var queryStmt = 'SELECT name FROM PIN_POINT';
    console.log('queryStmt = '+queryStmt);
    
    tx.executeSql(queryStmt,[],queryCurrentListsSuccess,errorCurrentLists);
}

function queryCurrentListsSuccess(tx, results) {
    
    var len = results.rows.length;
    console.log('result len list COUNT == '+len);
    
    $('#popup_list').empty();   
    
    window.localStorage.setItem("only_one",len);
    for(var i=0;i<len;i++){
        $('#popup_list').append('<li id="popup_sub_item" class="popup_text"><p>'+results.rows.item(i).name+'</p></li>');
    }           
}


//Transaction error callback
function errorCurrentLists(err) {
    alert("errorCurrentLists ::--- Error processing SQL: "+err);
}



$('#popup_sub_item').live('click',function(){
                          
                          
                          var only_one = window.localStorage.getItem("only_one");
                          only_one = parseInt(only_one);
                          
                          var list_title = window.localStorage.getItem("title_of_list");
                          
                          var new_list=$(this).children('p').text();
                          window.localStorage.setItem("new_list",new_list);
                          
                          if(only_one == 1 || list_title == new_list){
                          
                          $('#temp_view').remove();
                          
                          }else{
                          
                          // 	delete from Database
                          //	window.localStorage.setItem("item_to_be_dropped",delete_by_item_name); set at line 931
                          deleteItemInCategory();
                          
                          // 	delete from UI
                          temp_main_ref.remove();
                          $('#temp_view').remove();
                          
                          moveRecord();
                          }
                          
                          $('#popupMenu').popup('close');
                          // refresh the page 4 	
                          $.mobile.changePage('#four');
                          });









//inserting into the database
function moveRecord() {
    
    console.log("inside moveRecord() !!!!");
    
    var list_title = window.localStorage.getItem("new_list");
    
    var insertStatement = "INSERT INTO "+list_title+" (listItemName  , listItemCategory, listItemImage, listQuantity) VALUES (?,?,?,?)";
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   var cur_name = window.localStorage.getItem("cur_name");
                   var cur_cat = window.localStorage.getItem("cur_cat");
                   var cur_url = window.localStorage.getItem("cur_url");
                   var cur_qty = window.localStorage.getItem("now");
                   
                   
                   console.log('cur_name = '+cur_name);
                   console.log('cur_cat = '+cur_cat);
                   console.log('cur_url = '+cur_url);
                   console.log('cur_qty = '+cur_qty);
                   
                   tx.executeSql(insertStatement, [cur_name,cur_cat,cur_url,cur_qty],moveRecordSucess, moveRecordError);
                   
                   });
    
}

function moveRecordSucess(){
    console.log(" moveRecordSucess......");
    
    // update the PIN_POINT TABLE
    getLatestCountFromList();
}






function getLatestCountFromList(){
    
    console.log("getLatestCountFromList()");
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    
    db.transaction(queryForLatestItems, errorCurrentLists);
}


function queryForLatestItems(tx) {
    
    console.log("queryForLatestItems(tx)");
    
    // get the title of the list
    var list_title = window.localStorage.getItem("new_list");
    
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryLatestItemsSuccess, errorCurrentLists);
}


function queryLatestItemsSuccess(tx, results) {
    console.log("queryItemsSuccess");
    
    
    var list_title = window.localStorage.getItem("new_list");
    
    var len = results.rows.length;
    console.log('result len == '+len);
    
    var newItemCount = results.rows.item(0).total_items;
    
    console.log(' total_items =  '+ results.rows.item(0).total_items);
    
    newItemCount++;
    
    console.log(newItemCount);
    
    console.log("Calling updateTotalItems() .... ");
    updateTotalItems(list_title,newItemCount);
}


function updationSucess(){
    console.log("Updation successfull.... :)");
    
    
}




//Transaction error callback
function moveRecordError(err) {
    alert("moveRecordError ::--- Error processing SQL: "+err);
}


$('#category_full_delete').live('click',function(){
                                
                                var temp=confirm("Are you sure you want to delete","");
                                
                                if(temp==true){
                                
                                // delete from database
                                var delete_by_category_name=$(this).siblings('p').text();
                                console.log(delete_by_category_name);
                                
                                deleteRecordsInCategory(delete_by_category_name);
                                // later the full page is refreshed so no need to refresh the master list / or delete single row        
                                }else{
                                console.log('Deletion canceled');
                                }
                                });



function deleteRecordsInCategory(delete_by_category_name){
    
    window.localStorage.setItem("category_to_be_dropped",delete_by_category_name); 
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(queryForDeletionCountFunc, errorLists);
}


function queryForDeletionCountFunc(tx){
    
    var list_title = window.localStorage.getItem("title_of_list");
    var delete_by_category_name = window.localStorage.getItem("category_to_be_dropped"); 
    
    // first query for the total number of items in the list
    var queryForDeletionCount = 'SELECT listItemID FROM ' + list_title + ' WHERE listItemCategory = "' + delete_by_category_name + '"';
    console.log(queryForDeletionCount);
    
    tx.executeSql(queryForDeletionCount,[],queryForDeletionCountSuccess,errorLists);
}


function queryForDeletionCountSuccess(tx, results) {
    
    console.log("Count to be subtracted later  == " + results.rows.length);
    
    window.localStorage.setItem("category_count_counter",results.rows.length);  
    
    
    
    var list_title = window.localStorage.getItem("title_of_list");
    var delete_by_category_name = window.localStorage.getItem("category_to_be_dropped"); 
    
    // now delete and make sure u update the PIP POINT table with total items --
    
    var deleteStatement = 'DELETE FROM ' + list_title + ' WHERE listItemCategory = "' + delete_by_category_name + '"';
    console.log(deleteStatement);
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    
    db.transaction(function(tx) {
                   tx.executeSql(deleteStatement,[],deletionCategorySucess, errorLists);
                   });
    
}


function deletionCategorySucess(){
    console.log('All items in category deleted ');
    //    $('#master_list').empty(); // to refresh properly
    getItemCountInThisList();
}




function getItemCountInThisList(){
    
    console.log("getItemCountInThisList()");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);           
    db.transaction(itemCountInThisList, errorLists);
}


function itemCountInThisList(tx) {
    
    console.log("queryForItems(tx)");
    
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryItemsInListSuccess, errorLists);
}


function queryItemsInListSuccess(tx, results) {
    
    console.log("queryItemsInListSuccess");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    var len = results.rows.length;
    console.log('result len has to be 1 yes == '+len);
    
    var receivedItemCount = results.rows.item(0).total_items;
    console.log('retrieved  total_items =  '+ receivedItemCount);
    
    var cntr=window.localStorage.getItem("category_count_counter");  // this has to be subtracted
    
    var newCount = parseInt(receivedItemCount) - parseInt(cntr);
    console.log('newCount'+newCount);
    
    updateTotalItemsInMain(list_title,newCount);
    
}


function updateTotalItemsInMain(list_name,items_count){
    console.log("Inside update function... () ....");
    
    
    // fetch the current date
    var d = new Date();
    var month = d.getMonth()+1;
    var day = d.getDate();
    
    // date in the format of year/month/day
    var updated_time = d.getFullYear() + '/' + ((''+month).length<2 ? '0' : '') + month + '/' + ((''+day).length<2 ? '0' : '') + day;
    
    
    
    var updateStatement = 'UPDATE PIN_POINT SET total_items = ?, upload_time = ? WHERE name = "'+list_name+'";';
    console.log('updateStatement ='+updateStatement);
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   tx.executeSql(updateStatement, [items_count,updated_time],updationSucessfull, errorCB);
                   });
}




function updationSucessfull(){
    
    console.log('updationSucessfull()');
    //empty master list will emptied inside this function
    
    // refresh the page
    getTotalItems();
}





/************************************* DYNAMIC DELETION ITEM WISE *************************************************************/


$('#catgeory_item_delete').live('click',function(){
                                
                                
                                var temp=confirm("Are you sure you want to delete","");
                                
                                if(temp==true){
                                // delete from database
                                var delete_by_item_name=$(this).siblings('h6').text();
                                console.log(delete_by_item_name);
                                
                                // delte from UI
                                $(this).parent().remove();
                                
                                // later the full page is refreshed so no need to refresh the master list / or delete single row
                                
                                window.localStorage.setItem("item_to_be_dropped",delete_by_item_name);
                                deleteItemInCategory();
                                
                                }else{
                                console.log('Deletion canceled');
                                }
                                });





/***************************** <,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */





function deleteItemInCategory(){
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(deleteTheItemInCategory, errorLists);
}

// no need for query only 1 item
function deleteTheItemInCategory(tx){
    
    
    var list_title = window.localStorage.getItem("title_of_list");
    var delete_by_item_name = window.localStorage.getItem("item_to_be_dropped"); 
    
    console.log('delete_by_item_name == '+delete_by_item_name);
    
    // first query for the total number of items in the list
    var deletionStatement = 'DELETE FROM ' + list_title + ' WHERE listItemName = "'+delete_by_item_name+'"';
    console.log(deletionStatement);
    
    tx.executeSql(deletionStatement,[],deleteItemInCategorySuccess,errorLists);
    
    
}


function deleteItemInCategorySuccess() {
    
    console.log('Deleted');
    getItemCountInThisListForUpdation();
}





function getItemCountInThisListForUpdation(){
    
    console.log("getItemCountInThisListForUpdation()");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(itemCountForUpdation, errorLists);
}


function itemCountForUpdation(tx) {
    
    console.log("itemCountForUpdation(tx)");
    // get the title of the list
    var list_title = window.localStorage.getItem("title_of_list");
    
    var queryStatement = 'SELECT total_items FROM PIN_POINT WHERE name = "'+list_title+'";';
    
    tx.executeSql(queryStatement, [], queryItemsForUpdationSuccess, errorLists);
}


function queryItemsForUpdationSuccess(tx, results) {
    
    console.log("queryItemsForUpdationSuccess");
    
    var list_title = window.localStorage.getItem("title_of_list");
    
    var len = results.rows.length;
    console.log('result len has to be 1 yes == '+len);
    
    
    var prevCount = results.rows.item(0).total_items;
    console.log('prevCount  total_items =  '+ prevCount);
    
    var updated_count = parseInt(prevCount) - 1;
    console.log('updated_count'+updated_count);
    
    $('#total_items_counter').html('Your list contains ' + updated_count + ' items.');
    updateTotalItems(list_title,updated_count);
}





/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/




// Transaction error callback
function errorLists(err) {
    alert("errorLists ::--- Error processing SQL: "+err);
}



























/****************************************************** PAGE 1 *******************************************************************/


$("#id_new_image").bind('tap',function() {      
                        $("#id_new_image").attr('src',"images/new_list_pressed.png");     
                        });

$( '#homepage' ).bind( "pagebeforeshow", function(){
                      $("#id_new_image").attr('src',"images/new_list_normal.png");    
                      });

$("#id_new_image").click(function(){
                         $.mobile.changePage('#oneB',{ transition: "slide"});
                         });



/****************************************************** PAGE 1b *******************************************************************/

// just to clear the text box everytime
$( '#oneB' ).bind( "pageshow", function(){
                  $('#id_text_box').val('');
                  
                  });



$("#id_cancel").bind('tap',function() {     
                     $("#id_cancel").attr('src',"images/cancel_pressed.png");      
                     });

$( '#oneB' ).bind( "pagebeforeshow", function(){
                  $("#id_cancel").attr('src',"images/cancel_normal.png");    
                  });

$("#id_cancel").click(function(){
                      $.mobile.changePage('#',{ transition: "slide",reverse: true});
                      });


// action to be done when create button is clicked
$('#id_create').click(function(){
                      
                      // get the value from the text box
                      var temp=$('#id_text_box').val();
                      
                      if(temp.indexOf(' ') > -1){
                      // there is a space
                      // replace all spaces with _    	
                      temp = temp.replace(/ /g, '_');
                      }
                      
                      //|| temp.indexOf(' ') > -1
                      if(temp == ''  ){
                      alert('Not a valid name');
                      $('#id_create').attr('href','#');
                      $.mobile.changePage('#',{ transition: "slide",reverse: true});
                      
                      }else{
                      
                      $('#id_create').attr('href','#two');
                      
                      // fetch the current date
                      var d = new Date();
                      var month = d.getMonth()+1;
                      var day = d.getDate();
                      
                      // date in the format of year/month/day
                      var updated = d.getFullYear() + '/' + ((''+month).length<2 ? '0' : '') + month + '/' + ((''+day).length<2 ? '0' : '') + day;
                      
                      
                      // update the database (This will insert in the PIN_POINT table)
                      insertRecord(temp,0,updated); 
                      
                      // save the title in the local storage
                      window.localStorage.setItem("title_of_list",temp);
                      
                      // update the UI
                      $('#id_ul').append('<li id="main_full_row" class="custom_listview_img"> <h1 class="list_title" id="list_title">'+ temp +'</h1><p class="list_items">'+ '0' +'</p> <p class="list_time">UPDATED :- '+updated+'</p><img  id="deleteMe" style="margin-left: 275px; margin-top: 49px;" src="images/curl.png" /></li>');
                      
                      console.log("inserted :--"+temp);
                      
                      
                      // Create the list table in the data base for later use
                      createListTable();
                      
                      }
                      });



// function to delete the list view row
$('#deleteMe').live('click', function(){
                    
                    window.localStorage.setItem("delete_check","yes");
                    
                    var delete_by_name=$(this).siblings('h1').text();
                    var temp=confirm('Are you sure you want to delete the shopping list ' + delete_by_name,'');
                    
                    if(temp==true){
                    
                    // delete from database
                    var delete_by_name=$(this).siblings('h1').text();
                    if(delete_by_name.indexOf(' ') > -1){
                    // there is a space
                    // replace all spaces with _    	
                    delete_by_name = delete_by_name.replace(/ /g, '_');
                    }
                    
                    console.log(delete_by_name);
                    deleteRecord(delete_by_name);
                    
                    // delte from UI
                    $(this).parent().remove();
                    $('#id_ul').listview('refresh');
                    
                    }else{
                    console.log('Deletion canceled');
                    }
                    
                    });

// function to show the title on the list view onClick();
$('#main_full_row').live('click',function(){
                         
                         var del_chk = window.localStorage.getItem("delete_check");
                         
                         if(del_chk == 'yes'){
                         window.localStorage.setItem("delete_check","no");
                         }else{
                         var title_of_list=$(this).children('h1').text();
                         
                         
                         if(title_of_list.indexOf(' ') > -1){
                         // there is a space
                         // replace all spaces with _    	
                         title_of_list = title_of_list.replace(/ /g, '_');
                         }
                         
                         
                         window.localStorage.setItem("title_of_list",title_of_list);
                         var title = window.localStorage.getItem("title_of_list");
                         console.log(title);
                         
                         $.mobile.changePage('#four',{ transition: "slide"});
                         }
                         
                         });






/****************************************************** PAGE 2 *******************************************************************/




// function to set the title in the header bar
$( '#two' ).bind( "pageshow", function(){
                 var title = window.localStorage.getItem("title_of_list");
                 console.log("page 2="+title);
                 
                 if(title.indexOf('_') > -1){
                 // there is a _
                 // replace all spaces with space
                 title = title.replace(/_/g, ' ');    	
                 }
                 
                 
                 $('#page2_title').html(title);
                 $('#id_of_search_key').val('');
                 });




$("#id_view_list , #id_view_list_2, #id_view_list_page5").bind('tap',function() {     
                                                               $("#id_view_list , #id_view_list_2, #id_view_list_page5").attr('src',"images/view_list_pressed.png");     
                                                               });

$( '#two' ).bind( "pagebeforeshow", function(){
                 $("#id_view_list").attr('src',"images/view_list.png");  
                 $("#id_x_1").attr('src',"images/x_normal.png");   
                 });

$( '#three' ).bind( "pagebeforeshow", function(){
                   $("#id_view_list_2").attr('src',"images/cancel_normal.png");  
                   $("#id_x_2").attr('src',"images/x_normal.png");   
                   });


$( '#four' ).bind( "pagebeforeshow", function(){
                  $("#id_x_3").attr('src',"images/x_normal.png");
                  $("#id_all_list").attr('src',"images/all_lists_normal.png");
                  $("#id_new_products").attr('src',"images/add_products_normal.png");    
                  $("#id_find_stores").attr('src',"images/find_store_normal.png");   
                  });


$( '#five' ).bind( "pagebeforeshow", function(){
                  $("#id_view_list_page5").attr('src',"images/view_list.png"); 
                  $("#id_x_4").attr('src',"images/x_normal.png");   
                  });




// function to change the view list image on mouse hover
$(function() {
  $("#id_view_list , #id_view_list_2, #id_view_list_page5")
  .click(function(){
         $.mobile.changePage('#four',{ transition: "slide",reverse: true});
         });
  });





$("#id_x_1 , #id_x_2, #id_x_3, #id_x_4").bind('tap',function() {      
                                              $("#id_x_1").attr('src',"images/x_pressed.png");        
                                              $("#id_x_2").attr('src',"images/x_pressed.png");
                                              $("#id_x_3").attr('src',"images/x_pressed.png");
                                              $("#id_x_4").attr('src',"images/x_pressed.png");
                                              });





// function to change the x pic
$(function() {
  $("#id_x_1 , #id_x_2, #id_x_3, #id_x_4")
  .click(function(){
         
         var temp=confirm("Are you sure you want to delete","");
         
         if(temp==true){
         var title = window.localStorage.getItem("title_of_list");
         console.log('to be delete'+title);
         
         // delete the record
         deleteRecord(title);
         
         // move to dash board
         $.mobile.changePage('#',{ transition: "slide",reverse: true});
         }else{
         $("#id_x_1 , #id_x_2, #id_x_3, #id_x_4").attr('src',"images/x_normal.png");
         }
         
         });
  });


$('#search_id').click(function(){
                      
                      
                      $('#search_content').css('height','450px');
                      
                      if( $('#id_of_search_key').val().length == 0 ){
                      alert("Enter item to search");
                      }else{	  
                      var search_for= $('#id_of_search_key').val();
                      searchIt(search_for);
                      }
                      });


var arrayItemName = new Array();
var arrayItemCategory = new Array();
var arrayItemID = new Array();
var arrayItemImage = new Array();
var arrayAisleNumber = new Array();




function searchIt(search_for){
    
    arrayItemName = [];
    arrayItemCategory = [];
    arrayItemID = [];
    arrayItemImage = [];
    arrayAisleNumber = [];
    
    //$.mobile.showPageLoadingMsg("a", "Searching...");
    
    showLoading();
    
    $('#product_list_view').empty();
    $('#category_list_view').empty();
    
    console.log('Search for '+search_for);
    
    var xmlhttp;
    
    if (window.XMLHttpRequest){
        xmlhttp=new XMLHttpRequest();
    }else{
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.open("GET","http://www.supermarketapi.com/api.asmx/SearchByProductName?APIKEY=93da6ed905&ItemName="+search_for,true);
    xmlhttp.send();
    
    xmlhttp.onreadystatechange=function(){
        
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            
            var xmlResponse = xmlhttp.responseXML;
            console.log("response XML =="+xmlResponse);
            
            
            
            
            // XML Parsing.
            arrayItemName = xmlResponse.getElementsByTagName("Itemname");
            arrayItemCategory = xmlResponse.getElementsByTagName("ItemCategory");
            arrayItemID = xmlResponse.getElementsByTagName("ItemID");
            arrayItemImage = xmlResponse.getElementsByTagName("ItemImage");
            arrayAisleNumber = xmlResponse.getElementsByTagName("AisleNumber");
            
            
            console.log("will call bufferData().....");
            bufferData();
            
            console.log("will call insertBufferRecords()....");
            insertBufferRecords(arrayItemName , arrayItemCategory, arrayItemID,  arrayItemImage, arrayAisleNumber);
            
            
            window.localStorage.setItem("search_count", arrayItemName.length);  
            
            
            var search_count = window.localStorage.getItem("search_count"); 
            console.log("search_count === "+search_count);
            
            // show proper UI image or list-view
            if(search_count==0 || search_count==null){
                $('#search_list').css('display','none');
                $('#search_noList').css('display','block');
                $('#search_content').css('height','450px');
            }else{
                $('#search_list').css('display','inline');
                $('#search_noList').css('display','none');
                $('#search_content').css('height','inherit');
            }
            
            
            
            
            
            for(i=0;i<arrayItemName.length;i++){
                
                
                var searchNameTemp=arrayItemName[i].childNodes[0].nodeValue;
                var searchQuantity = searchNameTemp.substring(searchNameTemp.indexOf('-')+1);
                var searchName = searchNameTemp.slice(0, searchNameTemp.indexOf("-")); 
                
                
                $('#product_list_view').append('<li class="custom_listview_img_edge"><img width="45" height="45" src="'+arrayItemImage[i].childNodes[0].nodeValue+'" /><p class="search_result_name">'+arrayItemName[i].childNodes[0].nodeValue+'</p><h6 class="search_qty">'+searchQuantity+'</h6><img id="add_this_product" class="rightside" src="images/add_item_normal.png" /></li>');
            }
            
            $('#product_list_view').listview('refresh');      
            
            $("#total_matches").html(arrayItemImage.length+"  matching items found");             
            $("#id_product").html('PRODUCTS ('+arrayItemImage.length+')');
            
            queryForCategories();
        }
    }
}


// called when the user clciks on ADD in the PRODUCTS section....
$('#add_this_product').live('click',function(){
                            
                            var double_check = $(this).attr('src');
                            
                            if(double_check == "images/add_item_pressed.png"){
                            alert('Already Added');
                            }else{
                            
                            // change the image of selected
                            $(this).attr('src',"images/add_item_pressed.png");
                            
                            // fetch the name of the list
                            var tmp=$(this).siblings('p').text();
                            console.log('added ===='+tmp+"#");
                            
                            window.localStorage.setItem("key_name_for_query",tmp); 
                            
                            // get the current total items from the db and update the PIN_POINT table's column total_items (UI)
                            getItemCountFromList(); // and update The update function is later called in the query success... updateTotalItems(list_title,new_count);
                            
                            
                            // query * from BUFFER where itemName = "xyz" in this case temp and then put that thing into the LIST table
                            getItemDataFromBuffer(); 
                            }
                            });





$('#add_category_full').live('click',function(){
                             
                             var double_check_cat = $(this).attr('src');
                             
                             if(double_check_cat == "images/add_item_pressed.png"){
                             alert('Already Added');
                             }else{
                             
                             // change the image of selected
                             $(this).attr('src',"images/add_item_pressed.png");
                             
                             // fetch the name of the list
                             var temp_catgeory=$(this).siblings('p').text();
                             console.log('Category to be added is == '+temp_catgeory);
                             
                             window.localStorage.setItem("temp_catgeory",temp_catgeory); 
                             
                             // check data in buffer @ category
                             // add that data to list table 
                             checkDataInBufferForCategory();
                             
                             // update the count (count == count + total new entries added)
                             
                             getBulkItemCountFromList();
                             }
                             });






/****************************************************** PAGE 3 *******  page 3 is page 2 only ************************************************************/


//function to toggle the tabs
$(function(){
  
  $('#id_product').click(function(){
                         
                         
                         
                         
                         $('#id_product').removeClass("normal");
                         $('#id_product').addClass("selected");
                         
                         $('#id_category').removeClass("selected");
                         $('#id_category').addClass("normal");
                         
                         $('#id_category_items').css('display','none');
                         $('#id_product_items').css('display','block');
                         
                         $('#id_product').css('color','black');
                         $('#id_category').css('color','white');
                         
                         
                         
                         });
  
  $('#id_category').click(function(){
                          
                          $('#id_product').removeClass("selected");
                          $('#id_product').addClass("normal");
                          
                          $('#id_category').removeClass("normal");
                          $('#id_category').addClass("selected");
                          
                          
                          $('#id_product_items').css('display','none');
                          $('#id_category_items').css('display','block');
                          
                          $('#id_product').css('color','white');
                          $('#id_category').css('color','black');
                          
                          
                          });
  });





/****************************************************** PAGE 4 *******************************************************************/


$("#id_all_list").bind('tap',function() {
                       
                       $("#id_all_list").attr('src',"images/all_lists_pressed.png");
                       
                       });


// function to set the title in the header bar
$( '#four' ).bind( "pageshow", function(){
                  var title = window.localStorage.getItem("title_of_list");
                  if(title.indexOf('_') > -1){
                  // there is a _
                  // replace all spaces with space
                  title = title.replace(/_/g, ' ');    	
                  }
                  
                  console.log("page 4's title == "+title);
                  
                  $('#page_title').html(title);
                  
                  // clear the previous UI
                  $('#master_list').empty();
                  
                  // update
                  getTotalItems();
                  
                  });

// function to change the all lists pic on mouse over
$(function() {
  $("#id_all_list").click(function(){
                          $.mobile.changePage('#',{ transition: "slide",reverse: true});
                          });
  });

$("#id_new_products").bind('tap',function() {     
                           $("#id_new_products").attr('src',"images/add_products_pressed.png");      
                           });




// function to change the new products pic on mouse over
$(function() {
  $("#id_new_products")
  .click(function(){
         console.log('add new products');
         $.mobile.changePage('#two',{ transition: "slide"});
         });
  });



$("#id_find_stores").bind('tap',function() {      
                          $("#id_find_stores").attr('src',"images/find_store_selected.png");      
                          });






// function to change the find-store pic on mouse over
$(function() {
  $("#id_find_stores")
  .click(function(){
         
         var isValid = window.localStorage.getItem("before_find_store_count");
         isValid = parseInt(isValid);
         
         if(isValid == 0 ){
         alert('No items in the list');
         $("#id_find_stores").attr('src',"images/find_store_normal.png");
         }else{
         console.log('redirecting to find nearby stores page ');
         $.mobile.changePage('#five',{ transition: "slide"});
         }
         
         });
  });






/****************************************************** PAGE 6 *******************************************************************/


$("#id_store").bind('tap',function() {      
                    $("#id_store").attr('src',"images/stores_pressed.png");     
                    });




// function to change the stores pic on mouse over
$(function() {
  $("#id_store")
  .click(function(){
         
         window.localStorage.setItem("fromBackToStores",12345);
         
         $.mobile.changePage('#five',{ transition: "slide",reverse: true});
         });
  });









/****************************************************** PAGE 7 *******************************************************************/



$("#id_back_to_store").bind('tap',function() {      
                            $("#id_back_to_store").attr('src',"images/back_pressed.png");     
                            });

$( '#seven' ).bind( "pagebeforeshow", function(){
                   $("#id_back_to_store").attr('src',"images/back.png");    
                   });
// function to change the back pic on mouse over
$(function() {
  $("#id_back_to_store")
  .click(function(){
         
         $.mobile.changePage('#six',{ transition: "slide",reverse: true});
         });
  });


/****************************************************** PAGE 8 *******************************************************************/
$("#id_back").bind('tap',function() {     
                   $("#id_back").attr('src',"images/back_pressed.png");      
                   });

$( '#eight' ).bind( "pagebeforeshow", function(){
                   $("#id_back").attr('src',"images/back.png");    
                   });



// function to change the back pic on mouse over
$(function() {
  $("#id_back")
  .click(function(){
         
         $.mobile.changePage('#six',{ transition: "slide",reverse: true});
         });
  });


/** LAST PAGE  PAGE 9 **/
$(".btn-slide").click(function(){
                      $("#panel").slideToggle("slow");
                      $("#not_panel").css('display','block');
                      
                      inflateSlidingDrawer();
                      
                      
                      });







// page 9 init
$( '#nine' ).bind( "pageshow", function(){
                  $("#panel").css('display','none');
                  $("#not_panel").css('display','block');
                  // clear the list initially
                  //$('#panel_list').empty();
                  
                  getAvailableItemDetails();
                  
                  
                  
                  });



$("#all_done").bind('tap',function() {     
                    $("#all_done").attr('src',"images/done_pressed.png");     
                    });



$(function() {
  $("#all_done")
  .click(function(){
         
         var sure = confirm('Are your done with your shopping ? Will move the un-available items to a new list so that you remember to shop them.','');
         
         if(sure==true){
         $.mobile.changePage('#ten',{ transition: "slide"});
         }else{
         // do nothing
         }
         
         });
  });



// page 10 init
$( '#ten' ).bind( "pageshow", function(){
                 
                 var delete_by_name = window.localStorage.getItem("title_of_list");
                 console.log('TABLE TO BE DELETED IS ===='+delete_by_name);
                 deleteRecord(delete_by_name);
                 
                 // fetch the current date
                 var d = new Date();
                 var month = d.getMonth()+1;
                 var day = d.getDate();
                 
                 // date in the format of year/month/day
                 var updated = d.getFullYear() + '/' + ((''+month).length<2 ? '0' : '') + month + '/' + ((''+day).length<2 ? '0' : '') + day;
                 
                 var time_stamp = new Date().getTime();
                 var time_stamp_name = 'NotGot'+time_stamp;
                 console.log('table name of not got is = '+time_stamp_name);
                 
                 if(notGotItArray.length != 0){
                 // update the database (This will insert in the PIN_POINT table)
                 insertRecord(time_stamp_name,notGotItArray.length,updated); 
                 
                 // save the title in the local storage
                 window.localStorage.setItem("title_of_list",time_stamp_name);
                 
                 // update the UI
                 $('#id_ul').append('<li id="main_full_row" class="custom_listview_img"> <h1 class="list_title" id="list_title">'+ time_stamp_name +'</h1><p class="list_items">'+ notGotItArray.length +'</p> <p class="list_time">UPDATED :- '+updated+'</p><img  id="deleteMe" style="margin-left: 275px; margin-top: 49px;" src="images/curl.png" /></li>');
                 
                 console.log("NOT GOT inserted :--"+time_stamp_name);
                 
                 
                 // Create the list table in the data base for later use
                 createNotGotListTable();
                 }
                 });





/************************ DB for not got ***************************************/


function createNotGotListTable(){
    console.log("inside createListTable() !!!!");
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(notGotListPopulate, notGotListError, notGotListSuccess);
}




// Create the database (Populate the database)
function notGotListPopulate(tx) {
    
    var table_name = window.localStorage.getItem("title_of_list");
    //alert('table to be created is ='+table_name);
    
    console.log("listPopulating.... listPopulate()");
    
    var dropListSQL = 'DROP TABLE IF EXISTS '+table_name;
    //alert('drop statement'+dropListSQL);
    console.log(dropListSQL);
    
    tx.executeSql(dropListSQL);
    
    var createListTableSQL = 'CREATE TABLE IF NOT EXISTS ' + table_name + '  (id integer primary key autoincrement, listItemName  , listItemCategory, listItemID,  listItemImage, listAisleNumber, listQuantity)';
    //alert(createListTableSQL);
    console.log(createListTableSQL);
    
    tx.executeSql(createListTableSQL);
    console.log("NOT GOT LIST  table is created...   :) ");
}


// Transaction error callback
function notGotListError(err) {
    alert("notGotListError::--- Error processing SQL: "+err);
}

// Transaction success callback
function notGotListSuccess() {
    console.log("notGotListSuccess  SUCCESS .............. ##################");   
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);     
    db.transaction(storeIntoNotGotListTable, notGotListError);
}




function storeIntoNotGotListTable(tx) {
    
    // table name is same as the title of the list
    var table_name = window.localStorage.getItem("title_of_list");
    console.log('NOT GOT inserting into table  ='+table_name);
    console.log("NOT GOT inserting into list table....");
    
    
    var insertListStatement = 'INSERT INTO ' + table_name + ' (listItemName  , listItemCategory, listItemID,  listItemImage, listAisleNumber, listQuantity)  VALUES (?,?,?,?,?,?)';
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    
    db.transaction(function(tx) 
                   {
                   for(var i=0;i<notGotItArray.length;i++){
                   tx.executeSql(insertListStatement, [notGotItArray[i] , notGotItCategoryArray[i] , 'no id' , notGotItURLArray[i], 'no aisle' , notGotItQtyArray[i]],insertedNotGotListSucess, notGotListError);
                   }
                   });
    
}


function insertedNotGotListSucess(){
    console.log("insertedListSucess......");
}



/******************************************************************************/
$("#pulldown").bind('tap',function() {      
                    $("#pulldown").attr('src',"images/pulldown_bar_pressed.png");     
                    });

$( '#nine' ).bind( "pagebeforeshow", function(){
                  $("#pulldown").attr('src',"images/pulldown_bar.png");    
                  $("#all_done").attr('src',"images/done.png");   
                  });

$(function() {
  $("#pulldown")
  .click(function(){
         // click is already handled by panel
         });
  });


/****************************************************** PAGE 10 *******************************************************************/




$("#id_back_dashboard").bind('tap',function() {     
                             $("#id_back_dashboard").attr('src',"images/dashboard_pressed.png");     
                             });

$( '#ten' ).bind( "pagebeforeshow", function(){
                 $("#id_back_dashboard").attr('src',"images/dashboard.png"); 
                 $("#id_another_list").attr('src',"images/another_list.png");  
                 });
// function to toggle the new list image
// on click goto the oneB page
$(function() {
  $("#id_back_dashboard")
  .click(function(){
         $.mobile.changePage('#homepage',{ transition: "slide",reverse: true});
         });
  });

$("#id_another_list").bind('tap',function() {     
                           $("#id_another_list").attr('src',"images/another_list_pressed.png");      
                           });



$(function() {
  $("#id_another_list")
  .click(function(){
         $.mobile.changePage('#oneB',{ transition: "slide"});
         });
  });

/*************************************************************************************************************************************/


/********** GALLERY   ******************/




// get the name of the store
// get all the images in the available list of the store....
// get all the name of items in the avilable list of the store....


var allImageNameArray = new Array();
var allImagesArray = new Array();
var allImageCategory = new Array();
var allImageQty = new Array();

var gotItArray = new Array();
var gotItURLArray = new Array();
var gotItQtyArray = new Array();
var gotItCategoryArray = new Array();

var notGotItArray = new Array();
var notGotItQtyArray = new Array();
var notGotItURLArray = new Array();
var notGotItCategoryArray = new Array();


function getAvailableItemDetails(){
    
    allImageNameArray=[];
    allImagesArray =[];
    allImageCategory = [];
    allImageQty = [];
    
    gotItArray = [];
    gotItURLArray = [];
    gotItQtyArray = [];
    gotItCategoryArray = [];
    
    notGotItArray = [];
    notGotItURLArray = [];
    notGotItQtyArray = [];
    notGotItCategoryArray = [];
    
    var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
    db.transaction(fetchAvailableItemDetails, errorGallery);
}


function fetchAvailableItemDetails(tx) {
    
    console.log("fetchAvailableItemDetails(tx)");
    
    
    var store_id = window.localStorage.getItem("store_id");
    var store_fullname = 'STORE_'+store_id;
    console.log('STORE FULL NAME ===== '+store_fullname);
    
    var fetchAvailableStatement = 'SELECT storeItemName  , storeItemCategory, storeItemID,  storeItemImage, storeAisleNumber, storeQuantity,storeAvailable FROM '+store_fullname+'  WHERE storeAvailable = "yes"';
    console.log('fetchAvailableStatement == '+fetchAvailableStatement);
    
    tx.executeSql(fetchAvailableStatement, [], fetchAvailableSuccess, errorGallery);
    
}





function fetchAvailableSuccess(tx, results) {
    
    console.log("fetchAvailableSuccess()...");
    
    var len = results.rows.length;
    console.log('Total ITEMS IN STORE ARE  ................  == '+len);
    
    
    for(var i=0;i<len;i++){                
        allImageNameArray.push(results.rows.item(i).storeItemName);
        allImagesArray.push(results.rows.item(i).storeItemImage);
        allImageCategory.push(results.rows.item(i).storeItemCategory);
        allImageQty.push(results.rows.item(i).storeQuantity);
        
    }
    
    for(var i=0;i<len;i++){                
        console.log('NAME >>> '+i+' <<<' +allImageNameArray[i]);
        console.log('URL >>> '+i+' <<<' +allImagesArray[i]);
        console.log('CATGEGORY >>> '+i+' <<<' +allImageCategory[i]);
        console.log('QUANTITY >>> '+i+' <<<' +allImageQty[i]);
    }
    
    setTheInitialImages();
}
// initialization
var i=1;
var cntr = 1;

function setTheInitialImages(){
    // initialization
    
    $('#left_image').attr('src',allImagesArray[0]);
    
    $('#active_image').attr('src',allImagesArray[1]);
    var tag_name = allImageNameArray[1];
    $('#gallery_product_name').html(tag_name);
    console.log('TAG NAME == '+tag_name);
    window.localStorage.setItem("tag_name",tag_name);
    window.localStorage.setItem("tag_url",allImagesArray[1]);
    window.localStorage.setItem("tag_category",allImageCategory[1]);
    window.localStorage.setItem("tag_qty",allImageQty[1]);
    
    $('#right_image').attr('src',allImagesArray[2]);
    
}


// Transaction error callback
function errorGallery(err) {
    alert("errorGallery ::--- Error processing SQL: "+err);
}

var animation_speed= 500;

function swipedRight(){
    
    console.log('...................................................................................................... RIGHT SWIPE ')
    console.log('swipedRight value of i== '+i);
    
    
    // LEFT
    $('#left_image').animate({'width': '0','margin-left': '100px'},animation_speed,function(){
                             
                             console.log('value of i== '+i);
                             
                             cntr = (i+2)%allImagesArray.length;
                             cntr = Math.abs(cntr);
                             console.log('COUNTER AT LEFT ==== '+cntr);
                             
                             $('#left_image').attr('src',allImagesArray[cntr]);
                             $('#left_image').css('margin-left','-5px');
                             $('#left_image').css('width','130px');
                             });
    
    // CENTER
    $('#active_image').animate({'width': '0','margin-left': '200px'},animation_speed,function(){
                               
                               cntr = (i+1)%allImagesArray.length;
                               cntr = Math.abs(cntr);
                               console.log('COUNTER AT CENTER ==== '+cntr);
                               
                               $('#active_image').attr('src',allImagesArray[cntr]);
                               tag_name = allImageNameArray[cntr];
                               console.log('TAG NAME == '+tag_name);
                               $('#gallery_product_name').html(tag_name);
                               
                               window.localStorage.setItem("tag_name",tag_name);
                               window.localStorage.setItem("tag_url",allImagesArray[cntr]);
                               window.localStorage.setItem("tag_category",allImageCategory[cntr]);
                               window.localStorage.setItem("tag_qty",allImageQty[cntr]);
                               
                               
                               $('#active_image').css('margin-left','99px');
                               $('#active_image').css('width','130px');
                               });
    
    // RIGHT
    $('#right_image').animate({'width': '0','margin-left': '300px'},animation_speed,function(){
                              
                              cntr = i%allImagesArray.length;
                              cntr = Math.abs(cntr);
                              
                              console.log('COUNTER AT RIGHT ==== '+cntr);
                              
                              $('#right_image').attr('src',allImagesArray[cntr]);
                              $('#right_image').css('margin-left','193px');
                              $('#right_image').css('width','130px');
                              });
    
    // move to next image 
    i++;
}



function swipedLeft(){
    
    console.log('...................................................................................................... LEFT SWIPE ')
    console.log('swipedLeft value of i== '+i);
    
    // LEFT
    $('#left_image').animate({width: 'toggle'},animation_speed,function(){
                             
                             console.log('ZERO value of i== '+i);
                             
                             cntr = i%allImagesArray.length;
                             console.log('COUNTER AT LEFT ==== '+cntr);
                             
                             $('#left_image').attr('src',allImagesArray[cntr]);
                             $('#left_image').css('display','block');
                             });
    
    // CENTER
    $('#active_image').animate({width: 'toggle'},animation_speed,function(){
                               
                               cntr = (i+1)%allImagesArray.length;
                               console.log('COUNTER AT CENTER ==== '+cntr);
                               
                               $('#active_image').attr('src',allImagesArray[cntr]);
                               tag_name = allImageNameArray[cntr];
                               console.log('TAG NAME == '+tag_name);
                               $('#gallery_product_name').html(tag_name);
                               window.localStorage.setItem("tag_name",tag_name);
                               window.localStorage.setItem("tag_url",allImagesArray[cntr]);
                               window.localStorage.setItem("tag_category",allImageCategory[cntr]);
                               window.localStorage.setItem("tag_qty",allImageQty[cntr]);
                               
                               $('#active_image').css('display','block');
                               });
    
    // RIGHT
    $('#right_image').animate({width: 'toggle'},animation_speed,function(){
                              
                              cntr = (i+2)%allImagesArray.length;
                              console.log('COUNTER AT RIGHT ==== '+cntr);
                              
                              $('#right_image').attr('src',allImagesArray[cntr]);
                              $('#right_image').css('display','block');
                              });
    
    // move to next image
    i++;
}

// Gallery LEFT-RIGHT SWIPE 
$(function(){
  
  $("#gallery_div").swiperight(function() {  
                               swipedRight(); 
                               });
  
  
  $("#gallery_div").swipeleft(function() {
                              swipedLeft();   
                              });
  
  });



function inflateSlidingDrawer(){
    
    console.log('inside inflateSlidingDrawer()');
    $('#panel_list').empty();
    
    /* for(var i=0;i<gotItArray.length;i++){
     $('#panel_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="panel_sub_category_img" src="'+gotItURLArray[i]+'" /><h6 class="panel_sub_category_name">'+gotItArray[i]+'</h6><p class="panel_sub_category_quantity"> QTY :- 12 oz </p><img class="panel_sub_category_rightside" src="images/got_it_checkmark.png" /></li>');
     }
     
     for(var i=0;i<notGotItArray.length;i++){
     $('#panel_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="panel_sub_category_img" src="'+notGotItURLArray[i]+'" /><h6 class="panel_sub_category_name">'+notGotItArray[i]+'</h6><p class="panel_sub_category_quantity"> QTY :- 12 oz </p><img class="panel_sub_category_rightside" src="images/cant_get_it_sad_face.png" /></li>');
     }*/
    
    
    
    var total_cnt = gotItArray.length + notGotItArray.length;
    var new_html = gotItArray.length + '/' + total_cnt +' items in the cart';
    $('.text_orange').html(new_html);
    
    var missed = total_cnt - gotItArray.length;
    var cant_get = "(CAN'T GET "+ missed + " ITEMS)";
    $('.text_gray').html(cant_get);
    
    
    
    
    
    // combine both the categories array
    console.log(' gotItCategoryArray.length BEFORE  === '+gotItCategoryArray.length);
    var unique_category_array = new Array();
    //unique_category_array = gotItCategoryArray;
    
    for(var i=0;i<gotItCategoryArray.length;i++){
        unique_category_array.push(gotItCategoryArray[i]);
    }
    
    console.log(' gotItCategoryArray.length AFTER  === '+gotItCategoryArray.length);
    
    for(var i=0;i<notGotItCategoryArray.length;i++){
        unique_category_array.push(notGotItCategoryArray[i]);
        console.log(' gotItCategoryArray.length AFTER FOR LOOP === '+gotItCategoryArray.length);
    }
    
    console.log(' gotItCategoryArray.length AFTER 2222 === '+gotItCategoryArray.length);
    // make a unique array of all categories 
    
    var unique_category_array=unique_category_array.filter(function(itm,i,unique_category_array){
                                                           return i==unique_category_array.indexOf(itm);
                                                           });
    console.log(' gotItCategoryArray.length AFTER 333333 === '+gotItCategoryArray.length);
    console.log('UNIQUE ARRAY IS AS FOLLOWS ');
    
    for(var i=0;i<unique_category_array.length;i++){
        console.log('At index '+ i +' == '+unique_category_array[i]);
    }
    console.log(' gotItCategoryArray.length AFTER 4444 === '+gotItCategoryArray.length);
    console.log('  gotItArray.length === '+ gotItArray.length);
    console.log(' gotItCategoryArray.length === '+gotItCategoryArray.length);
    console.log(' unique_category_array.length === '+unique_category_array.length);
    console.log('notGotItCategoryArray.length ==== '+notGotItCategoryArray.length);
    
    
    
    for(var i=0;i<unique_category_array.length;i++){
        var is_category = unique_category_array[i];
        
        // append cat
        $('#panel_list').append('<li class="categories_major_panel"><p class="panel_category">'+is_category+'</p></li>');
        
        for(var j=0;j<gotItCategoryArray.length;j++){
            console.log('first for loop count == '+j);
            
            if(gotItCategoryArray[j] == is_category){
                // add the item in index j
                $('#panel_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="panel_sub_category_img" src="'+gotItURLArray[j]+'" /><h6 class="panel_sub_category_name">'+gotItArray[j]+'</h6><p class="panel_sub_category_quantity"> QTY :- '+gotItQtyArray[j]+' </p><img class="panel_sub_category_rightside" src="images/got_it_checkmark.png" /></li>');
            }
        }
        
        for(var j=0;j<notGotItCategoryArray.length;j++){
            if(notGotItCategoryArray[j] == is_category){
                // add the item in index j
                $('#panel_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="panel_sub_category_img" src="'+notGotItURLArray[j]+'" /><h6 class="panel_sub_category_name">'+notGotItArray[j]+'</h6><p class="panel_sub_category_quantity"> QTY :- '+notGotItQtyArray[j]+' </p><img class="panel_sub_category_rightside" src="images/cant_get_it_sad_face.png" /></li>');
            } 
        }
    }
    $('#panel_list').listview('refresh');
}

// Sliding drawer TOP/DOWN SWIPE
$(function(){
  
  $("#down_swipe").bind('swipedown',function() {
                        $("#panel").slideDown("fast");
                        $("#not_panel").css('display','none');
                        //$('#panel_list').listview('refresh');
                        inflateSlidingDrawer();
                        });
  
  $("#down_swipe").bind('swipeup',function() {
                        $("#panel").slideUp("fast");
                        $("#not_panel").css('display','block');
                        });
  
  });




// on clikck og got it / not got it 
$(function(){
  
  $('.got_it_div').click(function(){
                         
                         console.log('GOT IT DIV ');
                         
                         var temp_name = window.localStorage.getItem("tag_name");
                         console.log('tag name  == '+temp_name);
                         
                         var temp_url = window.localStorage.getItem("tag_url");
                         console.log('temp_url == '+temp_url);
                         
                         var temp_cat = window.localStorage.getItem("tag_category");
                         console.log('temp_cat == '+temp_cat);
                         
                         var temp_qty = window.localStorage.getItem("tag_qty");
                         console.log('temp_qty == '+temp_qty);
                         
                         var check_flag_got_it = gotItArray.indexOf(temp_name);
                         console.log('CHECK FLAG check_flag_got_it == '+check_flag_got_it);
                         
                         if(check_flag_got_it == -1){ // NOT PRESENT , add it 
                         console.log('item added to gotItArray[]');
                         
                         gotItArray.push(temp_name); // add name to the got it list
                         gotItURLArray.push(temp_url);
                         gotItCategoryArray.push(temp_cat);
                         gotItQtyArray.push(temp_qty);
                         
                         // add to UI
                         //$('#panel_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="panel_sub_category_img" src="'+window.localStorage.getItem("tag_url")+'" /><h6 class="panel_sub_category_name">'+temp_name+'</h6><p class="panel_sub_category_quantity"> QTY :- 12 oz </p><img class="panel_sub_category_rightside" src="images/got_it_checkmark.png" /></li>');
                         
                         
                         var check_flag_not_got_it = notGotItArray.indexOf(temp_name);
                         console.log('CHECK FLAG check_flag_not_got_it == '+check_flag_not_got_it);
                         
                         if(check_flag_not_got_it != -1 ){ // PRESENT , delete it
                         // delete it
                         console.log('DELETE FROM NOT GOT ARRAY');
                         notGotItArray.splice(check_flag_not_got_it,1);
                         notGotItURLArray.splice(check_flag_not_got_it,1);
                         notGotItCategoryArray.splice(check_flag_not_got_it,1);
                         notGotItQtyArray.splice(check_flag_not_got_it,1);
                         }
                         
                         // update the drawer
                         }else{
                         alert('already added '+temp_name);
                         }
                         
                         // just to clear the hover effect
                         $('.got_it_div').trigger('mouseleave');
                         
                         });
  
  
  
  
  $('.not_got_it_div').click(function(){
                             
                             console.log('NOT GOT IT DIV ');
                             
                             var temp_name = window.localStorage.getItem("tag_name");
                             console.log('tag name  == '+temp_name);
                             
                             var temp_url = window.localStorage.getItem("tag_url");
                             console.log('temp_url == '+temp_url);
                             
                             var temp_cat = window.localStorage.getItem("tag_category");
                             console.log('temp_cat == '+temp_cat);
                             
                             var temp_qty = window.localStorage.getItem("tag_qty");
                             console.log('temp_qty == '+temp_qty);
                             
                             var flag_notGotItArray = notGotItArray.indexOf(temp_name);
                             console.log('CHECK FLAG flag_notGotItArray == '+flag_notGotItArray);
                             
                             if(flag_notGotItArray == -1){ // NOT PRESENT , add it 
                             console.log('item added to notGotItArray[]');
                             
                             notGotItArray.push(temp_name); // add name to the NOT got it list
                             notGotItURLArray.push(temp_url);
                             notGotItCategoryArray.push(temp_cat);
                             notGotItQtyArray.push(temp_qty);
                             
                             var flag_delete = gotItArray.indexOf(temp_name);
                             console.log('CHECK FLAG flag_delete == '+flag_delete);
                             
                             if(flag_delete != -1 ){ // PRESENT , delete it
                             // delete it
                             console.log('DELETE FROM GOT ARRAY');
                             gotItArray.splice(flag_delete,1);
                             gotItURLArray.splice(flag_delete,1);
                             gotItCategoryArray.splice(flag_delete,1);
                             gotItQtyArray.splice(flag_delete,1);
                             
                             
                             }
                             
                             // update the drawer
                             }else{
                             alert('already deleted '+temp_name);
                             }
                             
                             
                             $('.not_got_it_div').trigger('mouseleave');
                             
                             });
  
  });


$(function() {
  $(".not_got_it_div")
  .mouseover(function() { 
             $(this).css('background','orange');
             })
  .mouseleave(function() {
              $(this).css('background','white');
              });      
  });

$(function() {
  $(".got_it_div")
  .mouseover(function() {        
             $(this).css('background','orange');           
             })
  .mouseleave(function() {       
              $(this).css('background','white');
              });        
  });