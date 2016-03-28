var app=angular.module("dbonyx",["AuctionCtrls","ItemCtrls","MenuCtrls","UserCtrls","ngRoute","ngCookies"]);app.config(["$routeProvider","$locationProvider",function(e,t){e.when("/",{templateUrl:"app/views/index.html"}).when("/auctions",{templateUrl:"app/views/auctions.html"}).when("/database",{templateUrl:"app/views/database.html"}).when("/character",{templateUrl:"app/views/character.html"}).when("/character/main",{templateUrl:"app/views/characterMain.html"}).when("/character/reputation",{templateUrl:"app/views/characterReputation.html"}).when("/character/achievements",{templateUrl:"app/views/characterAchievements.html"}).when("/character/mounts",{templateUrl:"app/views/characterMounts.html"}).when("/character/battlepets",{templateUrl:"app/views/characterBattlepets.html"}).when("/character/professions",{templateUrl:"app/views/characterProfessions.html"}).when("/character/pvp",{templateUrl:"app/views/characterPvp.html"}).when("/character/:characterName",{templateUrl:"app/views/character.html"}).when("/item/:id",{templateUrl:"app/views/item.html"}).when("/mount/:id",{templateUrl:"app/views/mount.html"}).when("/profile",{controller:"userCtrl",templateUrl:"app/views/profile.html"}).when("/register",{templateUrl:"app/views/register.html"}).when("/validate/:user/:validateString",{templateUrl:"app/views/validate.html"}).otherwise({templateUrl:"app/views/404.html"}),t.html5Mode(!0)}]).factory("onyxPersistence",["$cookies",function(e){var t,a={},r={};return a.setRealm=function(a){t=a,e.put("realm",a)},a.getRealm=function(){return t||e.get("realm")||""},a.set=function(t,a){r[t]=a,e.put(t,a)},a.get=function(t){return r[t]||e.get(t)||""},a}]).controller("characterCtrl",["onyxPersistence","onyxCharacter","$scope","$http","$location","$routeParams",function(e,t,a,r,n,c){a.character=t,a.search=function(e){e&&e.preventDefault;var t=c.characterName||a.characterName||"",r=a.realmInput||!1;a.character.search(t,r,function(e){e?1===e.count?n.url("/character/main"):a.results=e:a.error="Unable to find character."})},a.selectCharacter=function(r){t.setCharacter(a.results[r]),e.set("characterName",a.results[r].name),e.set("characterRealm",a.results[r].realm),e.set("characterRegion",a.results[r].region.toUpperCase()),$window.location.href="/character/main"},a.realmInput=e.get("characterRealm")+"-"+e.get("characterRegion"),a.characterName=e.get("characterName"),c.characterName&&(e.set("characterName",c.characterName),a.characterName=e.get("characterName"),a.search())}]).controller("characterMain",["onyxPersistence","onyxCharacter","$scope",function(e,t,a){a.character=t,a.character.get("items"),a.character.get("mounts"),a.character.get("achievements"),a.character.get("reputation")}]).controller("characterProfessions",["onyxCharacter","$scope",function(e,t){t.character=e,t.character.get("professions"),t.expandRecipes=[!1,!1,!1,!1,!1,!1],t.expandToggle=function(e){t.expandRecipes[e]=!t.expandRecipes[e]}}]).controller("mountCtrl",["$scope","$routeParams","$http",function(e,t,a){e.mountId=parseInt(t.id),e.mount={},e.loading=!0,e.mountId&&a({method:"GET",url:"/api/mount/"+e.mountId}).then(function(t){e.mount=t.data.mount},function(e){})}]).factory("onyxCharacter",["$http","onyxPersistence",function(e,t){var a={},r=[];return a.loaded=!1,a.setCharacter=function(e){for(key in e)a[key]=e[key]},a.runOnLoad=function(){for(var e=0;e<r.length;e++)a.get(r[e])},a.search=function(r,n,c){if(a.loading=!0,!r)return a.loading=!1,void c(!1);var o={name:r};n&&(o.realm=n),e({method:"GET",url:"/api/character/load",params:o}).then(function(e){1===e.data.count?(t.set("characterName",r),t.set("characterRealm",e.data.character.realm),t.set("characterRegion",e.data.character.region),a.setCharacter(e.data.character),a.loading=!1,a.loaded=!0,a.runOnLoad(),c(e.data)):(a.loading=!1,c(e.data.characters))},function(e){a.loading=!1,t.set("characterName",""),c(!1)})},a.get=function(t){if(!a.loaded)return void r.push(t);if(!a[t]){if(!a.name||!a.realm||!a.region)return;var n={name:a.name,realm:a.realm,region:a.region};e({method:"GET",url:"/api/character/"+t,params:n}).then(function(e){a[t]=e.data[t]},function(e){})}},a.init=function(){var e=t.get("characterName"),r=t.get("characterRealm"),n=t.get("characterRegion"),c=r+"-"+n;"string"==typeof e&&""!==e&&a.search(e,c,function(e){})},a.init(),a}]).controller("watchlistCtrl",["$scope","$http",function(e,t){var a=function(){t({method:"GET",url:"/api/watchlist/"}).then(function(t){e.watchlists=t.data.watchlists},function(e){})};a(),e.watchlists=[]}]).directive("sidebar",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/sidebar.html"}}]).directive("mainContent",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/mainContent.html"}}]),angular.module("AuctionCtrls",[]).factory("auctionService",["$http",function(e){var t={searchTerm:"",realmInput:"",filters:{qualities:[]},resultPages:0,currentPage:1,resultHigh:0,resultLow:0,limit:25,loading:!1,auctionResults:[]};return t.setSearchTerm=function(e){t.searchTerm=e},t.setRealm=function(e){t.realmInput=e},t.search=function(a){t.realmInput&&e({method:"GET",url:"/api/auction/fetchauctions",params:{filters:t.filters,searchTerm:t.searchTerm,realm:t.realmInput,offset:(t.currentPage-1)*t.limit,limit:t.limit}}).then(function(e){t.loading=!1,t.auctionResults=e.data,t.resultPages=Math.ceil(t.auctionResults.count/t.limit),t.resultLow=(t.currentPage-1)*t.auctionLimit,t.resultHigh=t.resultLow+t.auctionResults.auctions.length,a(!0)},function(e){t.loading=!1,a(!1)})},t.updatePage=function(e){e=parseInt(e),e>t.resultPages&&(e=t.resultPages),1>e&&(e=1),t.currentPage=e},t.firstPage=function(){t.updatePage(1)},t.backPage=function(){t.updatePage(t.currentPage-1)},t.nextPage=function(){t.updatePage(t.currentPage+1)},t.lastPage=function(){t.updatePage(t.resultPages)},t}]).controller("AuctionCtrl",["$scope","$http","$location","$routeParams","onyxPersistence","auctionService",function(e,t,a,r,n,c){e.searchTerm="",e.realmInput=n.getRealm(),e.realms=[],e.auctionResults=c.auctionResults,e.loading=!1,e.filters=c.filters,e.updatePages=function(){e.backPages=[],e.nextPages=[],e.low=c.resultLow,e.high=c.resultHigh;for(var t=c.currentPage-5;t<c.currentPage;t++)t>0&&e.backPages.push(t);for(var t=c.currentPage+1;t<=c.currentPage+5;t++)t<=c.resultPages&&e.nextPages.push(t);e.currentPage=c.currentPage},e.updatePage=function(t){c.updatePage(t),e.search()},e.firstPage=function(){c.firstPage(),e.search()},e.nextPage=function(){c.nextPage(),e.search()},e.backPage=function(){c.backPage(),e.search()},e.lastPage=function(){c.lastPage(),e.search()},e.clearQualityFilter=function(){e.filters.qualities=[],e.firstPage()};var o=function(t){e.loading=!1,e.auctionResults=c.auctionResults,e.updatePages()};e.search=function(t){t&&t.preventDefault(),e.loading=!0,c.filters=e.filters,c.setSearchTerm(e.searchTerm),c.setRealm(e.realmInput),c.search(o)},e.search()}]).directive("selectOnFocus",["$window",function(e){return{restrict:"A",link:function(t,a,r){a.on("focus",function(){e.getSelection().toString()||this.setSelectionRange(0,this.value.length)})}}}]).directive("auctionResult",function(){return{restrict:"E",replace:!0,templateUrl:"app/templates/auctionResult.html"}}).directive("watchlistForm",function(){var e=["$scope","$http","onyxUser",function(e,t,a){e.user=a,e.minQuantity=1,e.item?e.maxQuantity=e.item.stackable||9999:e.maxQuantity=9999,e.price||(e.price=0),e.originalPrice=e.price,e.gold=Math.floor(e.price/1e4),e.silver=Math.floor(e.price%1e4/100),e.copper=e.price%100,e.submit=function(){var a=parseInt(e.copper+100*e.silver+1e4*e.gold);t({method:"POST",url:"/api/watchlist",data:{price:a,item:e.item._id,min:e.minQuantity,max:e.maxQuantity,realm:e.realmInput}}).then(function(e){console.log(e.data)},function(e){console.log(e.data)})}}];return{restrict:"E",controller:e,scope:{item:"=",price:"@",showWatchlist:"=",realmInput:"="},templateUrl:"app/templates/watchlist.html"}}).directive("autoComplete",function(){var e=["onyxPersistence","$scope","$http",function(e,t,a){t.realmInputSelected=!1,t.realms=[],t.blurIn=function(e){0==t.realms.length&&t.getRealms(),t[e]=!0},t.blurOut=function(e){t[e]=!1},t.getRealms=function(){t.realms=["Loading Realms"],a({method:"GET",url:"/api/realms"}).then(function(e){t.realms=e.data},function(e){t.realms=["Unable to Load Realms"]})},t.selectRealm=function(a){t.realmInput=a,e.setRealm(a),setTimeout(t.search,0)},t.hover=function(e){t.hoverIndex=e}}];return{restrict:"E",replace:!0,scope:{realmInput:"=",search:"&"},templateUrl:"app/templates/autoComplete.html",controller:e}}).directive("money",function(){var e=["$scope",function(e){e.amount=parseInt(e.amount),e.copper=e.amount%100,e.silver=parseInt(e.amount/100)%100,e.gold=parseInt(e.amount/1e4)}];return{restrict:"E",replace:!0,scope:{amount:"="},templateUrl:"app/templates/money.html",controller:e}}),angular.module("ItemCtrls",[]).controller("itemCtrl",["$scope","$http","$location","$routeParams",function(e,t,a,r){e.id=r.id}]).directive("itemDisplay",function(){var e=["$scope","$http",function(e,t){e.inventoryTypes=["None","Head","Neck","Shoulder","Shirt","Chest","Waist","Pants","Feet","Wrist","Hands","Finger","Trinket","One-handed Weapon","Shield","Bow","Back","Two-handed Weapon","Bag","Tabard","Chest","Main-hand Weapon","Off-hand Weapon","Held in Off-Hand","Projectile","Thrown","Gun"],e.item="Loading",e.getItem=function(){var a=e.itemId;e.loading=!0,t({method:"GET",url:"/api/item/"+a}).then(function(t){e.item=t.data.item,e.loading=!1},function(t){e.item=t.data,e.loading=!1})},e.getItem(),e.inventoryType=function(){return e.inventoryTypes[parseInt(e.item.inventoryType)]}}];return{controller:e,restrict:"E",replace:!0,scope:{itemId:"@"},templateUrl:"app/templates/itemDisplay.html"}}).directive("itemLink",[function(){var e=["$scope",function(e){e.quantity&&1!==parseInt(e.quantity)&&(e.showQuantity=!0)}];return{controller:e,scope:{item:"=",quantity:"@"},replace:!0,templateUrl:"app/templates/itemLink.html"}}]),angular.module("UserCtrls",[]).factory("onyxUser",["$http",function(e){var t={loggedin:!1};return t.checkLoggedInStatus=function(){e({method:"POST",url:"/api/user/getUser"}).then(function(e){t.username=e.data.username,t.loggedin=!0},function(e){})},t.validateUser=function(t,a,r){e({method:"POST",url:"/api/user/validate",data:{username:t,validateString:a}}).then(function(e){return console.log("Success!"),e},function(e){return r(e.data.error)})},t.login=function(a,r){e({method:"POST",url:"/api/user/login",data:{email:a,password:r}}).then(function(e){t.username=e.data.username,t.email=e.data.email,t.loggedin=!0},function(e){})},t.logout=function(){e({method:"POST",url:"/api/user/logout"}).then(function(e){t.username="",t.email="",t.loggedin=!1},function(e){})},t.register=function(a,r,n,c,o){e({method:"POST",url:"/api/user/register",data:{username:a,email:r,password1:n,password2:c}}).then(function(e){return t.username="",t.email="",t.loggedin=!1,o(!0)},function(e){return o(null,e.data.error)})},t.checkLoggedInStatus(),t}]).controller("validateCtrl",["$http","$location","$scope","$routeParams","onyxUser",function(e,t,a,r,n){n.validateUser(r.user,r.validateString,function(e){a.error=e})}]).controller("userCtrl",["onyxUser","$scope","$http","$location",function(e,t,a,r){t.user=e,t.showRegisterForm=!1,t.login={},t.showUserPanel=!1,t.showRegister=function(){t.showRegisterForm=!t.showRegisterForm},t.login=function(){e.login(t.login.email,t.login.password)},t.logout=function(){e.logout()},t.toggleUserPanel=function(){t.showUserPanel=!t.showUserPanel}}]).directive("userRegisterForm",[function(){var e=["$scope","onyxUser",function(e,t){e.register=function(){t.register(e.username,e.email,e.password1,e.password2,function(t,a){t?e.showRegister():a&&console.log(a)})}}];return{controller:e,restrict:"E",replace:!0,templateUrl:"app/templates/userRegisterForm.html"}}]),angular.module("MenuCtrls",[]).controller("MenuCtrl",["$scope",function(e){}]).directive("menuBar",[function(){var e=["$scope",function(e){var t;e.menus=[],this.select=e.select=function(t){e.hover=t,angular.forEach(e.menus,function(e){e.selected=!1}),t.selected=!0,e.menuSelected=!0},this.off=e.off=function(){e.hover=!1,t=setTimeout(function(){e.hover||(e.menuSelected=!1,e.$apply())},500)},this.addMenu=function(t){e.menus.push(t)}}];return{restrict:"E",transclude:!0,scope:{},controller:e,templateUrl:"app/templates/menuBar.html"}}]).directive("menu",[function(){return{require:"^^menuBar",restrict:"E",transclude:!0,scope:{title:"@",link:"@"},link:function(e,t,a,r){r.addMenu(e),t.on("mouseover",function(){r.select(e)}),t.on("mouseleave",function(){r.off()})},templateUrl:"app/templates/menu.html"}}]);