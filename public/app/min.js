var app=angular.module("dbonyx",["AuctionCtrls","ItemCtrls","MenuCtrls","UserCtrls","ngRoute","ngCookies"]);app.config(["$routeProvider","$locationProvider",function(e,t){e.when("/",{templateUrl:"app/views/index.html"}).when("/auctions",{templateUrl:"app/views/auctions.html"}).when("/database",{templateUrl:"app/views/database.html"}).when("/character",{templateUrl:"app/views/character.html"}).when("/character/main",{templateUrl:"app/views/characterMain.html"}).when("/character/reputation",{templateUrl:"app/views/characterReputation.html"}).when("/character/achievements",{templateUrl:"app/views/characterAchievements.html"}).when("/character/mounts",{templateUrl:"app/views/characterMounts.html"}).when("/character/battlepets",{templateUrl:"app/views/characterBattlepets.html"}).when("/character/professions",{templateUrl:"app/views/characterProfessions.html"}).when("/character/pvp",{templateUrl:"app/views/characterPvp.html"}).when("/character/:characterName",{templateUrl:"app/views/character.html"}).when("/item/:id",{templateUrl:"app/views/item.html"}).when("/mount/:id",{templateUrl:"app/views/mount.html"}).when("/profile",{controller:"userCtrl",templateUrl:"app/views/profile.html"}).when("/register",{templateUrl:"app/views/register.html"}).when("/validate/:user/:validateString",{templateUrl:"app/views/validate.html"}).otherwise({templateUrl:"app/views/404.html"}),t.html5Mode(!0)}]).factory("onyxPersistence",["$cookies",function(e){var t,a={},r={};return a.setRealm=function(a){t=a,e.put("realm",a)},a.getRealm=function(){return t||e.get("realm")||""},a.set=function(t,a){r[t]=a,e.put(t,a)},a.get=function(t){return r[t]||e.get(t)||""},a}]).controller("characterCtrl",["onyxPersistence","onyxCharacter","$scope","$http","$location","$routeParams",function(e,t,a,r,n,o){a.character=t,a.search=function(e){e&&e.preventDefault;var t=o.characterName||a.characterName||"",r=a.realmInput||!1;a.character.search(t,r,function(e){e?1===e.count?n.url("/character/main"):a.results=e:a.error="Unable to find character."})},a.selectCharacter=function(r){t.setCharacter(a.results[r]),e.set("characterName",a.results[r].name),e.set("characterRealm",a.results[r].realm),e.set("characterRegion",a.results[r].region.toUpperCase()),$window.location.href="/character/main"},a.realmInput=e.get("characterRealm")+"-"+e.get("characterRegion"),a.characterName=e.get("characterName"),o.characterName&&(e.set("characterName",o.characterName),a.characterName=e.get("characterName"),a.search())}]).controller("characterMain",["onyxPersistence","onyxCharacter","$scope",function(e,t,a){a.character=t,a.character.get("items"),a.character.get("mounts"),a.character.get("achievements"),a.character.get("reputation")}]).controller("characterProfessions",["onyxCharacter","$scope",function(e,t){t.character=e,t.character.get("professions"),t.expandRecipes=[!1,!1,!1,!1,!1,!1],t.expandToggle=function(e){t.expandRecipes[e]=!t.expandRecipes[e]}}]).controller("mountCtrl",["$scope","$routeParams","$http",function(e,t,a){e.mountId=parseInt(t.id),e.mount={},e.loading=!0,e.mountId&&a({method:"GET",url:"/api/mount/"+e.mountId}).then(function(t){e.mount=t.data.mount},function(e){})}]).factory("onyxCharacter",["$http","onyxPersistence",function(e,t){var a={},r=[];return a.loaded=!1,a.setCharacter=function(e){for(key in e)a[key]=e[key]},a.runOnLoad=function(){for(var e=0;e<r.length;e++)a.get(r[e])},a.search=function(r,n,o){if(a.loading=!0,!r)return a.loading=!1,void o(!1);var i={name:r};n&&(i.realm=n),e({method:"GET",url:"/api/character/load",params:i}).then(function(e){1===e.data.count?(t.set("characterName",r),t.set("characterRealm",e.data.character.realm),t.set("characterRegion",e.data.character.region),a.setCharacter(e.data.character),a.loading=!1,a.loaded=!0,a.runOnLoad(),o(e.data)):(a.loading=!1,o(e.data.characters))},function(e){a.loading=!1,t.set("characterName",""),o(!1)})},a.get=function(t){if(!a.loaded)return void r.push(t);if(!a[t]){if(!a.name||!a.realm||!a.region)return;var n={name:a.name,realm:a.realm,region:a.region};e({method:"GET",url:"/api/character/"+t,params:n}).then(function(e){a[t]=e.data[t]},function(e){})}},a.init=function(){var e=t.get("characterName"),r=t.get("characterRealm"),n=t.get("characterRegion"),o=r+"-"+n;"string"==typeof e&&""!==e&&a.search(e,o,function(e){})},a.init(),a}]).controller("watchlistCtrl",["$scope","$http",function(e,t){var a=function(){t({method:"GET",url:"/api/watchlist/"}).then(function(t){e.watchlists=t.data.watchlists},function(e){})};a(),e.watchlists=[]}]).directive("sidebar",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/sidebar.html"}}]).directive("mainContent",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/mainContent.html"}}]),angular.module("AuctionCtrls",[]).controller("AuctionCtrl",["$scope","$http","$location","$routeParams","onyxPersistence",function(e,t,a,r,n){e.searchTerm="",e.realmInput=n.getRealm(),e.filters={},e.filters.qualities=[],e.realms=[],e.hoverIndex="",e.totalPages=0,e.auctionPage=1,e.currentPage=1,e.auctionLimit=25,e.updatePages=function(){e.backPages=[],e.nextPages=[],e.totalPages=Math.ceil(e.auctionResults.count/e.auctionLimit),e.low=(e.auctionPage-1)*e.auctionLimit,e.high=e.low+e.auctionResults.auctions.length;for(var t=e.auctionPage-5;t<e.auctionPage;t++)t>0&&e.backPages.push(t);for(var t=e.auctionPage+1;t<=e.auctionPage+5;t++)t<=e.totalPages&&e.nextPages.push(t);e.currentPage=e.auctionPage},e.updatePage=function(t){t=parseInt(t),t>e.totalPages&&(t=e.totalPages),1>t&&(t=1),e.auctionPage=t,e.search()},e.firstPage=function(){e.updatePage(1)},e.nextPage=function(){e.updatePage(e.auctionPage+1)},e.backPage=function(){e.updatePage(e.auctionPage-1)},e.lastPage=function(){e.updatePage(e.totalPages)},e.changePage=function(t){e.auctionPage=parseInt(t),e.search()},e.clearQualityFilter=function(){e.filters.qualities=[],e.firstPage()},e.search=function(a){a&&a.preventDefault(),e.loading=!0,t({method:"GET",url:"/api/auction/fetchauctions",params:{filters:e.filters,qualities:e.filters.qualities,searchTerm:e.searchTerm,realm:e.realmInput,offset:(e.auctionPage-1)*e.auctionLimit,limit:e.auctionLimit}}).then(function(t){e.loading=!1,e.auctionResults=t.data,e.updatePages()},function(t){e.loading=!1,console.log(t)})},e.init=function(){e.realmInput&&e.firstPage()},e.init()}]).directive("selectOnFocus",["$window",function(e){return{restrict:"A",link:function(t,a,r){a.on("focus",function(){e.getSelection().toString()||this.setSelectionRange(0,this.value.length)})}}}]).directive("auctionResult",function(){var e=["$scope",function(e){}];return{restrict:"E",replace:!0,controller:e,templateUrl:"app/templates/auctionResult.html"}}).directive("watchlistForm",function(){var e=["$scope","$http",function(e,t){e.minQuantity=1,e.item?e.maxQuantity=e.item.stackable||9999:e.maxQuantity=9999,e.price||(e.price=0),e.originalPrice=e.price,e.gold=Math.floor(e.price/1e4),e.silver=Math.floor(e.price%1e4/100),e.copper=e.price%100,e.submit=function(){var a=parseInt(e.copper+100*e.silver+1e4*e.gold);t({method:"POST",url:"/api/watchlist",data:{price:a,item:e.item._id,min:e.minQuantity,max:e.maxQuantity,realm:e.realmInput}}).then(function(e){console.log(e.data)},function(e){console.log(e.data)})}}];return{restrict:"E",controller:e,scope:{item:"=",price:"@",showWatchlist:"=",realmInput:"="},templateUrl:"app/templates/watchlist.html"}}).directive("autoComplete",function(){var e=["onyxPersistence","$scope","$http",function(e,t,a){t.realmInputSelected=!1,t.realms=[],t.blurIn=function(e){0==t.realms.length&&t.getRealms(),t[e]=!0},t.blurOut=function(e){t[e]=!1},t.getRealms=function(){t.realms=["Loading Realms"],a({method:"GET",url:"/api/realms"}).then(function(e){t.realms=e.data},function(e){t.realms=["Unable to Load Realms"]})},t.selectRealm=function(a){t.realmInput=a,e.setRealm(a),setTimeout(t.search,0)},t.hover=function(e){t.hoverIndex=e}}];return{restrict:"E",replace:!0,scope:{realmInput:"=",search:"&"},templateUrl:"app/templates/autoComplete.html",controller:e}}).directive("money",function(){var e=["$scope",function(e){e.amount=parseInt(e.amount),e.copper=e.amount%100,e.silver=parseInt(e.amount/100)%100,e.gold=parseInt(e.amount/1e4)}];return{restrict:"E",replace:!0,scope:{amount:"="},templateUrl:"app/templates/money.html",controller:e}}),angular.module("ItemCtrls",[]).controller("itemCtrl",["$scope","$http","$location","$routeParams",function(e,t,a,r){e.id=r.id}]).directive("itemDisplay",function(){var e=["$scope","$http",function(e,t){e.inventoryTypes=["None","Head","Neck","Shoulder","Shirt","Chest","Waist","Pants","Feet","Wrist","Hands","Finger","Trinket","One-handed Weapon","Shield","Bow","Back","Two-handed Weapon","Bag","Tabard","Chest","Main-hand Weapon","Off-hand Weapon","Held in Off-Hand","Projectile","Thrown","Gun"],e.item="Loading",e.getItem=function(){var a=e.itemId;e.loading=!0,t({method:"GET",url:"/api/item/"+a}).then(function(t){e.item=t.data.item,e.loading=!1},function(t){e.item=t.data,e.loading=!1})},e.getItem(),e.inventoryType=function(){return e.inventoryTypes[parseInt(e.item.inventoryType)]}}];return{controller:e,restrict:"E",replace:!0,scope:{itemId:"@"},templateUrl:"app/templates/itemDisplay.html"}}).directive("itemLink",[function(){var e=["$scope",function(e){e.quantity&&1!==parseInt(e.quantity)&&(e.showQuantity=!0)}];return{controller:e,scope:{item:"=",quantity:"@"},replace:!0,templateUrl:"app/templates/itemLink.html"}}]),angular.module("UserCtrls",[]).factory("onyxUser",["$http",function(e){var t={loggedin:!1};return e({method:"GET",url:"/api/user/getUser"}).then(function(e){t.username=e.data.username,t.email=e.data.email,t.loggedin=!0},function(e){}),t}]).controller("validateCtrl",["$http","$location","$scope","$routeParams",function(e,t,a,r){e({method:"POST",url:"/api/user/validate",data:{username:r.user,validateString:r.validateString}}).then(function(e){t.url("/")},function(e){a.error=e.data.error})}]).controller("userCtrl",["onyxUser","$scope","$http","$location",function(e,t,a,r){t.user=e,t.showRegisterForm=!1,t.login={},t.showUserPanel=!1,t.showRegister=function(){t.showRegisterForm=!t.showRegisterForm},t.login=function(){a({method:"POST",url:"/api/user/login",data:{email:t.login.email,password:t.login.password}}).then(function(e){t.user.username=e.data.username,t.user.email=e.data.email,t.user.loggedin=!0},function(e){})},t.logout=function(){a({method:"POST",url:"/api/user/logout"}).then(function(e){t.user.username="",t.user.email="",t.user.loggedin=!1,r.url("/")},function(e){})},t.toggleUserPanel=function(){t.showUserPanel=!t.showUserPanel}}]).directive("userRegisterForm",[function(){var e=["$scope","$http","$location",function(e,t,a){e.register=function(){t({method:"POST",url:"/api/user/register",data:{username:e.username,email:e.email,password1:e.password1,password2:e.password2}}).then(function(t){e.user.username="",e.user.email="",e.user.loggedin=!1,e.showRegister()},function(e){console.log(e.data)})}}];return{controller:e,restrict:"E",replace:!0,templateUrl:"app/templates/userRegisterForm.html"}}]),angular.module("MenuCtrls",[]).controller("MenuCtrl",["$scope",function(e){}]).directive("menuBar",[function(){var e=["$scope",function(e){var t;e.menus=[],this.select=e.select=function(t){e.hover=t,angular.forEach(e.menus,function(e){e.selected=!1}),t.selected=!0,e.menuSelected=!0},this.off=e.off=function(){e.hover=!1,t=setTimeout(function(){e.hover||(e.menuSelected=!1,e.$apply())},500)},this.addMenu=function(t){e.menus.push(t)}}];return{restrict:"E",transclude:!0,scope:{},controller:e,templateUrl:"app/templates/menuBar.html"}}]).directive("menu",[function(){return{require:"^^menuBar",restrict:"E",transclude:!0,scope:{title:"@",link:"@"},link:function(e,t,a,r){console.log(r),r.addMenu(e),t.on("mouseover",function(){r.select(e)}),t.on("mouseleave",function(){r.off()})},templateUrl:"app/templates/menu.html"}}]);