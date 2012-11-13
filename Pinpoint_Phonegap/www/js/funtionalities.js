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
  $( '#homepage' ).bind( "pagebeforeshow", function(){
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

           // inflate the list view 
      $('#id_ul').append('<li class="custom_listview_img"> <h1 class="list_title" id="list_title">'+ results.rows.item(i).name +'</h1><p class="list_items">'+ results.rows.item(i).total_items +'</p> <p class="list_time">UPDATED :- '+results.rows.item(i).upload_time+'</p><img  id="deleteMe" style="margin-left: 275px; margin-top: 49px;" src="images/curl.png" /></li>');
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

      


      for(var i=0;i<len;i++){
        categoriesArray[i]=results.rows.item(i).arrayItemCategory;
        console.log('Category  --  '+i+'=='+results.rows.item(i).arrayItemCategory);

        $('#category_list_view').append('<li class="categories_major"><p class="search_category">'+results.rows.item(i).arrayItemCategory+'</p><img id="add_category_full" class="category_img_align" src="images/add_item_normal.png"></li>');
      }
      
      // after adding all the items refresh the list view.                                 
      $('#category_list_view').listview('refresh');     

      $.mobile.hidePageLoadingMsg();
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

      
      if(total_count != 0){

        var db = window.openDatabase("Database", "1.0", "Pin Point", 200000);
        db.transaction(queryCategoriesInListTable, errorLists);

      }else{
        console.log('no items in the list');
        $('#master_list').empty();        
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

        // clear the previous UI
        $('#master_list').empty();

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


      $('#master_list').append('<li class="categories_major"><p class="text_of_category">'+results.rows.item(0).listItemCategory+'</p><img id="category_full_delete" class="img_of_category" src="images/search_x_normal.png"></li>');

      for(var i=0;i<len;i++){                
        $('#master_list').append('<li class="custom_listview_img_edge"><img width="45" height="45" class="sub_category_img" src="'+results.rows.item(0).listItemImage+'" /><h6 class="sub_category_name">'+results.rows.item(i).listItemName+'</h6><p class="sub_category_quantity"> QTY :-' + results.rows.item(i).listQuantity + ' </p><img id="catgeory_item_delete" class="sub_category_rightside" src="images/search_x_normal.png" /></li>');
      }
      
      // after adding all the rows refresh the master list
      $('#master_list').listview('refresh');           
}


/************************************* DYNAMIC DELETION CATEGORY WISE ************************************************************************************/

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

  alert('Deleted');
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

      updateTotalItems(list_title,updated_count);
}

  



/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/




// Transaction error callback
    function errorLists(err) {
        alert("errorLists ::--- Error processing SQL: "+err);
    }



























/****************************************************** PAGE 1 *******************************************************************/

// function to toggle the new list image
// on click goto the oneB page
$(function() {
    $("#id_new_image")
        .mouseover(function() { 
           $(this).attr('src',"images/new_list_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/new_list_normal.png");
        })
        .click(function(){
          $.mobile.changePage('#oneB');
        });
});


/****************************************************** PAGE 1b *******************************************************************/

// just to clear the text box everytime
$( '#oneB' ).bind( "pagebeforeshow", function(){
    $('#id_text_box').val('');
});


// function to change the cancel image on mouse over
// onclick go back to the Dash board.
$(function() {
    $("#id_cancel")
        .mouseover(function() { 
           $(this).attr('src',"images/cancel_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/cancel_normal.png");
        })
        .click(function(){
          $.mobile.changePage('#');
    });
});


$('#id_create').click(function(){

    // get the value from the text box
    var temp=$('#id_text_box').val();
  
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
    $('#id_ul').append('<li class="custom_listview_img"> <h1 class="list_title" id="list_title">'+ temp +'</h1><p class="list_items">'+ '0' +'</p> <p class="list_time">UPDATED :- '+updated+'</p><img  id="deleteMe" style="margin-left: 275px; margin-top: 49px;" src="images/curl.png" /></li>');

    console.log("inserted :--"+temp);


    // Create the list table in the data base for later use
    createListTable();
});



// function to delete the list view row
$('#deleteMe').live('click', function(){

    var temp=confirm("Are you sure you want to delete","");
    
    if(temp==true){

        // delete from database
        var delete_by_name=$(this).siblings('h1').text();
        console.log(delete_by_name);
        deleteRecord(delete_by_name);

        // delte from UI
        $(this).parent().remove();
        $('#id_ul').listview('refresh');
        
    }else{
        alert('Deletion canceled');
    }
    
});

// function to show the title on the list view onClick();
$('#list_title').live('click',function(){
   
    var title_of_list=$(this).text();
    

    window.localStorage.setItem("title_of_list",title_of_list);
    var title = window.localStorage.getItem("title_of_list");
    console.log(title);

    $.mobile.changePage('#four');

});






/****************************************************** PAGE 2 *******************************************************************/




// function to set the title in the header bar
$( '#two' ).bind( "pagebeforeshow", function(){
    var title = window.localStorage.getItem("title_of_list");
    console.log("page 2="+title);

    $('#page2_title').html(title);

});

// function to change the view list image on mouse hover
$(function() {
    $("#id_view_list , #id_view_list_2, #id_view_list_page5")
        .mouseover(function() { 
           $(this).attr('src',"images/view_list_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/view_list.png");
        })
        .click(function(){

          $.mobile.changePage('#four');

        });
});


// function to change the x pic
$(function() {
    $("#id_x_1 , #id_x_2, #id_x_3, #id_x_4")
        .mouseover(function() { 
           $(this).attr('src',"images/x_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/x_normal.png");
        })
        .click(function(){

            var temp=confirm("Are you sure you want to delete","");
                
            if(temp==true){
                var title = window.localStorage.getItem("title_of_list");
                console.log('to be delete'+title);

                // delete the record
                deleteRecord(title);

                // move to dash board
                $.mobile.changePage('#');
            }
            
        });
});


$('#search_id').click(function(){

  var search_for= $('#id_of_search_key').val();
  
  searchIt(search_for);
 
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

  $.mobile.showPageLoadingMsg("a", "Searching...");

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
      }else{
        $('#search_list').css('display','inline');
        $('#search_noList').css('display','none');
      }


        
      

      for(i=0;i<arrayItemName.length;i++){


        var searchNameTemp=arrayItemName[i].childNodes[0].nodeValue;
        var searchQuantity = searchNameTemp.substring(searchNameTemp.indexOf('-')+1);
        var searchName = searchNameTemp.slice(0, searchNameTemp.indexOf("-")); 


        $('#product_list_view').append('<li class="custom_listview_img_edge"><img width="45" height="45"src="'+arrayItemImage[i].childNodes[0].nodeValue+'" /><p class="search_result_name">'+arrayItemName[i].childNodes[0].nodeValue+'</p><h6 class="search_qty">'+searchQuantity+'</h6><img id="add_this_product" class="rightside" src="images/add_item_normal.png" /></li>');
      }
                                   
      $('#product_list_view').listview('refresh');      
      $("#total_matches").html(arrayItemImage.length+"  Matches found");             

      
      queryForCategories();
    }
  }
}


// called when the user clciks on ADD in the PRODUCTS section....
$('#add_this_product').live('click',function(){

  // change the image of selected
  $(this).attr('src',"images/add_item_pressed.png");

  // fetch the name of the list
  var tmp=$(this).siblings('p').text();
  console.log('added ===='+tmp+"#");

  window.localStorage.setItem("key_name_for_query",tmp); 

  // get the current total items from the db and update the PIN_POINT table's column total_items (UI)
  getItemCountFromList(); // and update The update function is later called in the query success... updateTotalItems(list_title,new_count);


  // query * from BUFFER where itemName = "xyz" and then put that thing into the LIST table
  getItemDataFromBuffer(); 

});





$('#add_category_full').live('click',function(){

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
     $('#id_product_items').css('display','inline');

     
    });

    $('#id_category').click(function(){

      $('#id_product').removeClass("selected");
      $('#id_product').addClass("normal");

      $('#id_category').removeClass("normal");
      $('#id_category').addClass("selected");


     $('#id_product_items').css('display','none');
     $('#id_category_items').css('display','inline');
     
    });
});


// delete hi hello later

//function to toggle the tabs
$(function(){

    $('#hi').click(function(){
     
      $('#hi').removeClass("normal");
      $('#hi').addClass("selected");



      $('#hello').removeClass("selected");
      $('#hello').addClass("normal");

   
    });

    $('#hello').click(function(){


      $('#hi').removeClass("selected");
      $('#hi').addClass("normal");

      $('#hello').removeClass("normal");
      $('#hello').addClass("selected");

    
     
    });
});




/****************************************************** PAGE 4 *******************************************************************/


                                                          



// function to set the title in the header bar
$( '#four' ).bind( "pagebeforeshow", function(){
    var title = window.localStorage.getItem("title_of_list");
    console.log("page 4's title == "+title);

    $('#page_title').html(title);

    $("#id_all_list").attr('src',"images/all_lists_normal.png");
    
    // update
    getTotalItems();
  
});





// function to change the all lists pic on mouse over
$(function() {
    $("#id_all_list")
        .mouseover(function() { 
           $(this).attr('src',"images/all_lists_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/all_lists_normal.png");
        })
        .click(function(){
          $.mobile.changePage('#');
        });
});

// function to change the new products pic on mouse over
$(function() {
    $("#id_new_products")
        .mouseover(function() { 
           $(this).attr('src',"images/add_products_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/add_products_normal.png");
        })
        .click(function(){
          console.log('add new products');
          $.mobile.changePage('#two');
        });
});

// function to change the find-store pic on mouse over
$(function() {
    $("#id_stores")
        .mouseover(function() { 
           $(this).attr('src',"images/find_store_selected.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/find_store_normal.png");
        })
        .click(function(){
          alert('aamir');
          //$.mobile.changePage('#');
        });
});






/****************************************************** PAGE 6 *******************************************************************/


// function to change the stores pic on mouse over
$(function() {
    $("#id_store")
        .mouseover(function() { 
           $(this).attr('src',"images/stores_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/stores.png");
        })
        .click(function(){
          alert('stores');
          //$.mobile.changePage('#');
        });
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
          alert('directions');
          //$.mobile.changePage('#');
        });
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
          alert('checkin');
          //$.mobile.changePage('#');
        });
});



/****************************************************** PAGE 7 *******************************************************************/

// function to change the back pic on mouse over
$(function() {
    $("#id_back")
        .mouseover(function() { 
           $(this).attr('src',"images/back_pressed.png");
        })
        .mouseout(function() {
          $(this).attr('src',"images/back.png");
        })
        .click(function(){
          alert('back');
          //$.mobile.changePage('#');
        });
});

