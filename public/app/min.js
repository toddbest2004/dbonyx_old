var app=angular.module("dbonyx",["AuctionCtrls","ItemCtrls","MenuCtrls","UserCtrls","ngRoute","ngCookies","ngAnimate"]);app.config(["$routeProvider","$locationProvider","$httpProvider",function(e,t,r){r.interceptors.push("AuthInterceptor"),e.when("/",{templateUrl:"app/views/index.html"}).when("/about",{templateUrl:"app/views/about.html"}).when("/auctions",{templateUrl:"app/views/auctions.html"}).when("/database",{templateUrl:"app/views/database.html"}).when("/character",{templateUrl:"app/views/character.html"}).when("/character/main",{templateUrl:"app/views/characterMain.html"}).when("/character/reputation",{templateUrl:"app/views/characterReputation.html"}).when("/character/achievements",{templateUrl:"app/views/characterAchievements.html"}).when("/character/mounts",{templateUrl:"app/views/characterMounts.html"}).when("/character/battlepets",{templateUrl:"app/views/characterBattlepets.html"}).when("/character/professions",{templateUrl:"app/views/characterProfessions.html"}).when("/character/pvp",{templateUrl:"app/views/characterPvp.html"}).when("/character/:characterName",{templateUrl:"app/views/character.html"}).when("/community",{templateUrl:"app/views/community.html"}).when("/feedback",{templateUrl:"app/views/feedback.html"}).when("/item/:id",{templateUrl:"app/views/item.html"}).when("/mount/:id",{templateUrl:"app/views/mount.html"}).when("/privacy",{templateUrl:"app/views/privacy.html"}).when("/profile",{controller:"privateProfileCtrl",templateUrl:"app/views/privateprofile.html"}).when("/profile/:username",{controller:"publicProfileCtrl",templateUrl:"app/views/publicprofile.html"}).when("/register",{templateUrl:"app/views/register.html"}).when("/terms",{templateUrl:"app/views/terms.html"}).when("/validate/:user/:validateString",{templateUrl:"app/views/validate.html"}).when("/forums",{controller:"forumCtrl",templateUrl:"app/views/forums/forumMain.html"}).when("/forums/cat/:categoryId",{controller:"forumCatCtrl",templateUrl:"app/views/forums/forumCategory.html"}).when("/forums/thread/:threadId",{controller:"forumThreadCtrl",templateUrl:"app/views/forums/forumThread.html"}).when("/forums/admin",{controller:"forumAdminCtrl",templateUrl:"app/views/forums/forumAdmin.html"}).otherwise({templateUrl:"app/views/404.html"}),t.html5Mode(!0)}]).factory("onyxPersistence",["$cookies",function(e){var t,r={},n={};return r.setRealm=function(r){t=r,e.put("realm",r)},r.getRealm=function(){return t||e.get("realm")||""},r.set=function(t,r){n[t]=r,e.put(t,r)},r.get=function(t){return n[t]||e.get(t)||""},r}]).controller("mountCtrl",["$scope","$routeParams","$http",function(e,t,r){e.mountId=parseInt(t.id),e.mount={},e.loading=!0,e.mountId&&r({method:"GET",url:"/api/mount/"+e.mountId}).then(function(t){e.mount=t.data.mount},function(e){})}]).controller("feedbackCtrl",["$http","$scope",function(e,t){t.showForm=!0,t.sendFeedback=function(){t.error="",t.message&&t.title?e({url:"/api/user/feedback",method:"POST",data:{title:t.title,message:t.message}}).then(function(e){t.success="Your message has been sent successfully!",t.showForm=!1},function(e){t.error="There was an error sending your message, please try again."}):t.error="Please provide a title and a message."}}]).controller("watchlistCtrl",["$scope","$http",function(e,t){var r=function(){t({method:"GET",url:"/api/watchlist/"}).then(function(t){e.watchlists=t.data.watchlists},function(e){})};r(),e.watchlists=[]}]),angular.module("dbonyx").controller("searchBarCtrl",["$scope","searchBar",function(e,t){e.search=function(){t.search(e.searchTerm,function(t,r){return t?void(e.results=[]):void(e.results=r)})},e.clear=function(){e.searchTerm="",e.results=[]},e.hide=function(){setTimeout(function(){e.results=[],e.$apply()},100)},e.clear()}]).factory("searchBar",["$http",function(e){var t={};return t.results={},t.search=function(t,r){if(t.length<3)return r(!1,[]);var n={url:"/api/item/search/"+t};e(n).then(function(e){r(!1,e.data)},function(e){r(e.data.error)})},t}]),angular.module("UserCtrls",[]).factory("onyxUser",["$http","Auth",function(e,t){var r={loggedin:!1};return r.checkLoggedInStatus=function(){r.loggedin=t.isLoggedIn(),r.loggedin&&e({method:"POST",url:"/api/user/getUser"}).then(function(e){r.username=e.data.username,r.loggedin=!0},function(e){})},r.validateUser=function(t,r,n){e({method:"POST",url:"/api/user/validate",data:{username:t,validateString:r}}).then(function(e){return e},function(e){return n("There was an error validating your email.")})},r.login=function(n,o,a){e({method:"POST",url:"/api/user/login",data:{email:n,password:o}}).then(function(e){t.saveToken(e.data.token),r.username=e.data.username,r.email=e.data.email,r.loggedin=!0,a(null,!0)},function(e){a(e.data.error,!1)})},r.logout=function(){t.removeToken(),r.loggedin=!1,r.username=null,r.email=null},r.register=function(t,n,o,a,i){e({method:"POST",url:"/api/user/register",data:{username:t,email:n,password1:o,password2:a}}).then(function(e){r.login(n,o,function(e,t){i(!0)})},function(e){return i(null,e.data.error)})},r.getPublicProfile=function(t,r){e({url:"/api/user/publicProfile",params:{username:t}}).then(function(e){return r(null,e.data)},function(e){return r(e.data.error)})},r.getPrivateProfile=function(t){e({url:"/api/user/privateProfile"}).then(function(e){return t(null,e.data)},function(e){return t(e.data.error)})},r.checkLoggedInStatus(),r}]).factory("Auth",["$window",function(e){return{saveToken:function(t){e.localStorage["onyx-token"]=t},getToken:function(){return e.localStorage["onyx-token"]},removeToken:function(){return e.localStorage.removeItem("onyx-token")},isLoggedIn:function(){var e=this.getToken();return!!e}}}]).factory("AuthInterceptor",["Auth",function(e){return{request:function(t){var r=e.getToken();return r&&(t.headers.Authorization="JWT "+r),t}}}]).controller("validateCtrl",["$http","$location","$scope","$routeParams","onyxUser",function(e,t,r,n,o){o.validateUser(n.user,n.validateString,function(e){r.error=e})}]).controller("userCtrl",["onyxUser","$scope","$http","$location","$window",function(e,t,r,n,o){t.user=e,t.showRegisterForm=!1,t.showUserPanel=!1,t.showRegisterForm=!1,t.toggleRegister=function(){t.showRegisterForm=!t.showRegisterForm,t.signin=!1},t.login=function(){t.signin=!1,e.login(t.login.email,t.login.password,function(e,r){t.login.email=null,t.login.password=null,e&&(t.error=e),t.showRegisterForm=!1})},t.logout=function(){e.logout(),t.user=e,t.showUserPanel=!1},t.toggleUserPanel=function(){t.showUserPanel=!t.showUserPanel},t.signinActive=function(){t.signin=!0,t.showRegisterForm=!1,t.narrow=o.innerWidth<750,document.getElementById("email").focus()},t.register=function(){e.register(t.username,t.email,t.password1,t.password2,function(e,r){e?(t.success="Registered Successfully!",t.toggleRegister()):r&&(t.registerError=r)})},t.clearError=function(){t.error=!1,t.registerError=!1,t.success=!1}}]).directive("userRegisterForm",[function(){return{restrict:"E",replace:!0,templateUrl:"app/templates/userRegisterForm.html"}}]).directive("userPanel",[function(){return{restrict:"E",replace:!0,templateUrl:"app/templates/userPanel.html"}}]),angular.module("AuctionCtrls",["oi.select"]).controller("AuctionCtrl",["$scope","$http","$location","$routeParams","onyxPersistence","auctionService","oiSelect",function(e,t,r,n,o,a,i){var l=r.search();e.searchTerm=l.s||"",e.realmInput=l.r||o.getRealm()||"",e.validFilters=[{name:"Item Level",type:"Number"},{name:"Required Level",type:"Number"},{name:"Is Equippable",type:"Boolean"}],e.itemQualities=["Poor","Common","Uncommon","Rare","Epic","Legendary","Artifact","Heirloom"],e.selectedQuality="",e.realms=[],e.auctionResults=a.auctionResults,e.loading=!1,e.filters=a.filters,e.newfilter={},e.validComparators=null,e.qualities={values:[]},e.updatePages=function(){e.backPages=[],e.nextPages=[],e.low=a.resultLow,e.high=a.resultHigh;for(var t=a.currentPage-5;t<a.currentPage;t++)t>0&&e.backPages.push(t);for(var t=a.currentPage+1;t<=a.currentPage+5;t++)t<=a.resultPages&&e.nextPages.push(t);e.currentPage=a.currentPage},e.updatePage=function(t){a.updatePage(t),e.search()},e.firstPage=function(){a.firstPage(),e.search()},e.nextPage=function(){a.nextPage(),e.search()},e.backPage=function(){a.backPage(),e.search()},e.lastPage=function(){a.lastPage(),e.search()},e.setSortBy=function(t){a.setSortBy(t),e.search()},e.updateFilter=function(){"Number"===e.validFilters[e.newfilter.type].type?(e.validComparators=[">","=","<"],e.showFilterValue=!0):"Boolean"===e.validFilters[e.newfilter.type].type&&(e.validComparators=["True","False"],e.showFilterValue=!1)},e.addFilter=function(){var t=e.validFilters[e.newfilter.type].name,r=e.newfilter.comparator,n=e.newfilter.value;a.filters.push({type:t,comparator:r,value:n}),e.newfilter={},e.showFilterValue=!1,e.validComparators=null,e.search()},e.removeFilter=function(t){a.filters.splice(t,1),e.search()};var s=function(t){e.loading=!1,e.auctionResults=a.auctionResults,e.updatePages()};e.search=function(t){t&&t.preventDefault(),e.loading=!0,a.qualities=e.qualities.values.map(function(e,t){return e?t.toString():null}).filter(function(e){return e}),a.filters=e.filters,a.setSearchTerm(e.searchTerm),a.setRealm(e.realmInput),a.search(s)},e.realmInput&&e.search()}]),angular.module("AuctionCtrls").directive("auctionResult",function(){var e=["$scope",function(e){e.toggleHistory=function(){e.showAuctionHistory=!e.showAuctionHistory}}];return{restrict:"E",replace:!0,controller:e,templateUrl:"app/templates/auctionResult.html"}}).directive("watchlistForm",function(){var e=["$scope","$http","onyxUser",function(e,t,r){e.user=r,e.minQuantity=1,e.item?e.maxQuantity=e.item.stackable||9999:e.maxQuantity=9999,e.price||(e.price=0),e.originalPrice=e.price,e.gold=Math.floor(e.price/1e4),e.silver=Math.floor(e.price%1e4/100),e.copper=e.price%100,e.submit=function(){var r=parseInt(e.copper+100*e.silver+1e4*e.gold);t({method:"POST",url:"/api/watchlist",data:{price:r,item:e.item._id,min:e.minQuantity,max:e.maxQuantity,realm:e.realmInput}}).then(function(e){},function(e){})}}];return{restrict:"E",controller:e,scope:{item:"=",price:"@",showWatchlist:"=",realmInput:"="},templateUrl:"app/templates/watchlist.html"}}).directive("auctionHistory",function(){var e=["$scope","auctionHistory",function(e,t){e.item&&t.search(e.item._id,e.realmInput,function(t,r){if(e.aucHistoryLoading=!1,t||!r)return t;e.histories=r.histories,e.count=e.histories.length,e.barwidth=Math.floor(480/e.count),e.barheight=280,e.width=e.barwidth*e.count;for(var n=0;n<e.histories.length;n++){var o=parseInt(e.histories[n].sellingPrice/e.histories[n].sold);e.histories[n].x=e.barwidth*n,e.histories[n].y=e.barheight-(e.barheight-25)*o/r.max,e.histories[n].averagePrice=o,e.histories[n].soldy=e.barheight+(40-40*(e.histories[n].sold/r.maxQuantity)),e.histories[n].soldheight=40*(e.histories[n].sold/r.maxQuantity),e.histories[n].expiredheight=40*(e.histories[n].expired/r.maxQuantity),e.histories[n].expiredy=e.histories[n].soldy-e.histories[n].expiredheight}}),e.aucHistoryLoading=!0,e.hoverIn=function(t){e.histories[t].selected=!0,e.selected=e.histories[t]},e.hoverOut=function(t){e.histories[t].selected=!1,e.selected=!1}}];return{restrict:"E",controller:e,scope:{item:"=",showAuctionHistory:"&",realmInput:"="},templateUrl:"app/templates/auctionHistory.html"}}),angular.module("AuctionCtrls").factory("auctionService",["$http",function(e){var t={searchTerm:"",realmInput:"",filters:[],qualities:[],sortBy:"buyout",sortOrder:-1,resultPages:0,currentPage:1,resultHigh:0,resultLow:0,limit:25,loading:!1,auctionResults:!1};return t.setSearchTerm=function(e){t.searchTerm=e},t.setRealm=function(e){t.realmInput=e},t.noMatch=function(){t.loading=!1,t.auctionResults=[],t.resultPages=0,t.resultLow=0,t.resultHigh=0},t.search=function(r){return t.realmInput.length?void e({method:"GET",url:"/api/auction/fetchauctions",params:{"qualities[]":t.qualities,"filters[]":t.filters,searchTerm:t.searchTerm,realm:t.realmInput,offset:(t.currentPage-1)*t.limit,limit:t.limit,sortBy:t.sortBy,sortOrder:t.sortOrder}}).then(function(e){t.loading=!1,t.auctionResults=e.data,t.resultPages=Math.ceil(t.auctionResults.count/t.limit),t.resultLow=(t.currentPage-1)*t.limit,t.resultHigh=t.resultLow+t.auctionResults.auctions.length,r(!0)},function(e){t.noMatch(),r(!1)}):(t.noMatch(),void r(!1))},t.setSortBy=function(e){t.sortBy===e?t.sortOrder*=-1:(t.sortBy=e,t.sortOrder=-1)},t.updatePage=function(e){e=parseInt(e),e>t.resultPages&&(e=t.resultPages),1>e&&(e=1),t.currentPage=e},t.firstPage=function(){t.updatePage(1)},t.backPage=function(){t.updatePage(t.currentPage-1)},t.nextPage=function(){t.updatePage(t.currentPage+1)},t.lastPage=function(){t.updatePage(t.resultPages)},t}]).factory("auctionHistory",["$http",function(e){var t={};return t.search=function(t,r,n){e({method:"GET",url:"/api/auction/auctionHistory",params:{item:t,realm:r}}).then(function(e){n(null,e.data)},function(e){n(e.data,null)})},t}]),angular.module("dbonyx").controller("characterCtrl",["onyxPersistence","onyxCharacter","$scope","$http","$location","$routeParams",function(e,t,r,n,o,a){r.character=t,r.search=function(e){e&&e.preventDefault;var t=a.characterName||r.characterName||"",n=r.realmInput||!1;r.character.search(t,n,function(e){e?1===e.count?o.url("/character/main"):r.results=e:r.error="Unable to find character."})},r.selectCharacter=function(n){t.setCharacter(r.results[n]),e.set("characterName",r.results[n].name),e.set("characterRealm",r.results[n].realm),e.set("characterRegion",r.results[n].region.toUpperCase()),$window.location.href="/character/main"},r.realmInput=e.get("characterRealm")+"-"+e.get("characterRegion"),r.characterName=e.get("characterName"),a.characterName&&(e.set("characterName",a.characterName),r.characterName=e.get("characterName"),r.search())}]).controller("characterMain",["onyxPersistence","onyxCharacter","$scope",function(e,t,r){r.character=t,r.character.get("items"),r.character.get("mounts"),r.character.get("achievements"),r.character.get("reputation")}]).controller("characterProfessions",["onyxCharacter","$scope",function(e,t){t.character=e,t.character.get("professions"),t.expandRecipes=[!1,!1,!1,!1,!1,!1],t.expandToggle=function(e){t.expandRecipes[e]=!t.expandRecipes[e]}}]),angular.module("dbonyx").factory("onyxCharacter",["$http","onyxPersistence",function(e,t){var r={},n=[];return r.loaded=!1,r.setCharacter=function(e){for(key in e)r[key]=e[key]},r.runOnLoad=function(){for(var e=0;e<n.length;e++)r.get(n[e])},r.search=function(n,o,a){if(r.loading=!0,!n)return r.loading=!1,void a(!1);var i={name:n};o&&(i.realm=o),e({method:"GET",url:"/api/character/load",params:i}).then(function(e){1===e.data.count?(t.set("characterName",n),t.set("characterRealm",e.data.character.realm),t.set("characterRegion",e.data.character.region),r.setCharacter(e.data.character),r.loading=!1,r.loaded=!0,r.runOnLoad(),a(e.data)):(r.loading=!1,a(e.data.characters))},function(e){r.loading=!1,t.set("characterName",""),a(!1)})},r.get=function(t){if(!r.loaded)return void n.push(t);if(!r[t]){if(!r.name||!r.realm||!r.region)return;var o={name:r.name,realm:r.realm,region:r.region};e({method:"GET",url:"/api/character/"+t,params:o}).then(function(e){r[t]=e.data[t]},function(e){})}},r.init=function(){var e=t.get("characterName"),n=t.get("characterRealm"),o=t.get("characterRegion"),a=n+"-"+o;"string"==typeof e&&""!==e&&r.search(e,a,function(e){})},r.init(),r}]),angular.module("oi.select",[]),angular.module("oi.select").provider("oiSelect",function(){return{options:{debounce:500,searchFilter:"oiSelectCloseIcon",dropdownFilter:"oiSelectHighlight",listFilter:"oiSelectAscSort",groupFilter:"oiSelectGroup",editItem:!1,newItem:!1,closeList:!0,saveTrigger:"enter tab blur"},version:{full:"0.2.20",major:0,minor:2,dot:20},$get:function(){return{options:this.options,version:this.version}}}}).factory("oiSelectEscape",function(){var e=/[-\/\\^$*+?.()|[\]{}]/g,t="\\$&";return function(r){return String(r).replace(e,t)}}).factory("oiSelectEditItem",function(){return function(e,t,r,n){return n?"":r(e)}}).factory("oiUtils",["$document","$timeout",function(e,t){function r(e,t,r){for(var n=t;n&&n.ownerDocument&&11!==n.nodeType;){if(r){if(n===e)return!1;if(n.className.indexOf(r)>=0)return!0}else if(n===e)return!0;n=n.parentNode}return!1}function n(n,o){function a(e){return e&&"INPUT"!==e.target.nodeName?void 0:(p=!1,u?void(p=!0):void t(function(){n.triggerHandler("blur")}))}function i(){c||(c=!0,t(function(){n.triggerHandler("focus")}))}function l(){u=!0}function s(e){u=!1;var i=e.target,l=r(n[0],i);p&&!l&&a(),l&&"INPUT"!==i.nodeName&&t(function(){o[0].focus()}),!l&&c&&(c=!1)}var c,u,p;return e[0].addEventListener("click",s,!0),n[0].addEventListener("mousedown",l,!0),n[0].addEventListener("blur",a,!0),o.on("focus",i),function(){e[0].removeEventListener("click",s),n[0].removeEventListener("mousedown",l,!0),n[0].removeEventListener("blur",a,!0),o.off("focus",i)}}function o(e,t){var r,n,o,a,l,c;t&&(n=e.offsetHeight,o=s(t,"height","margin"),a=e.scrollTop||0,r=i(t).top-i(e).top+a,l=r,c=r-n+o,r+o>n+a?e.scrollTop=c:a>r&&(e.scrollTop=l))}function a(e,t,r,n,o){function a(e){return parseFloat(o[e])}for(var i=r===(n?"border":"content")?4:"width"===t?1:0,l=0,s=["Top","Right","Bottom","Left"];4>i;i+=2)"margin"===r&&(l+=a(r+s[i])),n?("content"===r&&(l-=a("padding"+s[i])),"margin"!==r&&(l-=a("border"+s[i]+"Width"))):(l+=a("padding"+s[i]),"padding"!==r&&(l+=a("border"+s[i]+"Width")));return l}function i(e){var t,r,n=e.getBoundingClientRect(),o=e&&e.ownerDocument;if(o)return t=o.documentElement,r=l(o),{top:n.top+r.pageYOffset-t.clientTop,left:n.left+r.pageXOffset-t.clientLeft}}function l(e){return null!=e&&e===e.window?e:9===e.nodeType&&e.defaultView}function s(e,t,r){var n=!0,o="width"===t?e.offsetWidth:e.offsetHeight,i=window.getComputedStyle(e,null),l=!1;if(0>=o||null==o){if(o=i[t],(0>o||null==o)&&(o=e.style[t]),f.test(o))return o;o=parseFloat(o)||0}return o+a(e,t,r||(l?"border":"content"),n,i)}function c(e){for(var t in e)if(e.hasOwnProperty(t)&&e[t].length)return!1;return!0}function u(e){var t=[];return angular.forEach(e,function(e,r){"$"!==r.toString().charAt(0)&&t.push(e)}),t}function p(e,t,r,n,o){var a,i,l,s,c,u=o?[].concat(e):[];for(a=0,l=e.length;a<e.length;a++)for(s=r?r(e[a]):e[a],i=0;i<t.length;i++)if(c=n?n(t[i]):t[i],angular.equals(s,c,e,t,a,i)){o?u.splice(a+u.length-l,1):u.push(t[i]);break}return u}function m(e,t,r,n){var o={};return e.split(".").reduce(function(e,r,n,o){return e[r]=n<o.length-1?{}:t},o),n(r,o)}var d=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,f=new RegExp("^("+d+")(?!px)[a-z%]+$","i");return{contains:r,bindFocusBlur:n,scrollActiveOption:o,groupsIsEmpty:c,objToArr:u,getValue:m,intersection:p}}]),angular.module("oi.select").directive("oiSelect",["$document","$q","$timeout","$parse","$interpolate","$injector","$filter","$animate","oiUtils","oiSelect",function(e,t,r,n,o,a,i,l,s,c){var u=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,p=/([^\(\)\s\|\s]*)\s*(\(.*\))?\s*(\|?\s*.+)?/;return{restrict:"AE",templateUrl:"src/template.html",require:"ngModel",scope:{},compile:function(e,m){var d=m.oiOptions,f=d?d.match(u):["","i","","","","i","","",""];if(!f)throw new Error("Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'");var h,g,v,w,y,$,b,P,I=/ as /.test(f[0])&&f[1],C=f[2]||f[1],S=f[5]||f[7],x=f[3]||"",k=f[4]||"",T=f[9]||C,U=f[8].match(p),E=U[1],R=E+(U[3]||""),F=E+(U[2]||""),L=I&&n(I),A=n(C),O=n(x),q=n(k),H=n(R),N=n(F),D=n(T),M=o(m.multiplePlaceholder||""),V=o(m.placeholder||""),B=n(m.oiSelectOptions),Q=angular.version.major<=1&&angular.version.minor<=3;return function(e,o,u,p){function m(){ce&&o.removeClass("cleanMode"),ce=!1}function d(e,t){t=t||150,o.addClass(e),r(function(){o.removeClass(e)},t)}function I(){e.listItemHide=!0,e.inputHide=!1}function C(){var t=J(p.$modelValue);e.listItemHide=!t,e.inputHide=t}function x(t){s.contains(o[0],t.target,"disabled")||e.output.length>=b&&s.contains(o[0],t.target,"select-dropdown")||(e.inputHide&&e.removeItem(0),!e.isOpen||!le.closeList||"INPUT"===t.target.nodeName&&e.query.length?X(e.query):(Z({query:le.editItem&&!ce}),e.$evalAsync()))}function k(t){e.isFocused||(e.isFocused=!0,u.disabled||(e.backspaceFocus=!1))}function T(t){e.isFocused=!1,$||C(),U("blur")||Z(),e.$evalAsync()}function U(n,o){o||(o=n,n=e.query);var a,i=le.saveTrigger.split(" ").indexOf(o)+1,l=le.newItem&&n,s="blur"!==o?e.order[e.selectorPosition]:null;return i&&(l||s)?(e.showLoader=!0,a=t.when(s||P(e.$parent,{$query:n})),a.then(function(n){if(void 0===n)return t.reject();e.addItem(n);var o=e.order.length-1;e.selectorPosition===o&&ee(ne,0),le.newItemFn&&!s||r(angular.noop),Z()})["catch"](function(){d("invalid-item"),e.showLoader=!1}),!0):void 0}function R(){var e=$&&J(p.$modelValue)?ae:oe;re.attr("placeholder",e)}function F(t){return s.getValue(S,t,e.$parent,D)}function _(t){return s.getValue(S,t,e.$parent,L)}function G(t){return s.getValue(S,t,e.$parent,A)}function W(t){return s.getValue(S,t,e.$parent,q)}function j(t){return s.getValue(S,t,e.$parent,O)||""}function z(t){return s.getValue(E,t,e.$parent,H)}function Y(e){return e=e instanceof Array?e:e?[e]:[],e.filter(function(e){return e&&(e instanceof Array&&e.length||L||G(e))})}function J(e){return!!Y(e).length}function X(n,a){return v&&ue&&r.cancel(v),v=r(function(){var i=N(e.$parent,{$query:n,$selectedAs:a})||"";return e.selectorPosition="prompt"===le.newItem?!1:0,n||a||(e.oldQuery=null),(i.$promise&&!i.$resolved||angular.isFunction(i.then))&&(ue=le.debounce),e.showLoader=!0,t.when(i.$promise||i).then(function(t){if(e.groups={},t&&!a){var r=$?e.output:[],i=ve(s.objToArr(t),n,G,we(e.$parent),o),l=s.intersection(i,r,F,F,!0),c=z(l);e.groups=te(c)}return K(),t})["finally"](function(){e.showLoader=!1,le.closeList&&!le.cleanModel&&r(function(){ee(ne,0)})})},ue)}function K(){var t,r,n,o=[],a=0;e.order=[],e.groupPos={};for(r in e.groups)e.groups.hasOwnProperty(r)&&"$"!=r.charAt(0)&&o.push(r);for(Q&&o.sort(),t=0;t<o.length;t++)r=o[t],n=e.groups[r],e.order=e.order.concat(n),e.groupPos[r]=a,a+=n.length}function Z(t){t=t||{},e.oldQuery=null,e.backspaceFocus=!1,e.groups={},e.order=[],e.showLoader=!1,e.isOpen=!1,ue=0,t.query||(e.query=""),v&&r.cancel(v)}function ee(t,r){e.selectorPosition=r,s.scrollActiveOption(t[0],t.find("li")[r])}function te(e){for(var t,r,n={"":[]},o=0;o<e.length;o++)t=j(e[o]),(r=n[t])||(r=n[t]=[]),r.push(e[o]);return n}p.$isEmpty=function(e){return!J(e)};var re=o.find("input"),ne=angular.element(o[0].querySelector(".select-dropdown")),oe=V(e),ae=M(e),ie=B(e.$parent)||{},le=angular.extend({cleanModel:"prompt"===ie.newItem},c.options,ie),se=le.editItem,ce="correct"===se,ue=0;se!==!0&&"correct"!==se||(se="oiSelectEditItem");var pe=se?a.get(se):angular.noop,me=n(le.removeItemFn);f=le.searchFilter.split(":");var de=i(f[0]),fe=n(f[1]);f=le.dropdownFilter.split(":");var he=i(f[0]),ge=n(f[1]);f=le.listFilter.split(":");var ve=i(f[0]),we=n(f[1]);f=le.groupFilter.split(":");var ye=i(f[0]),$e=n(f[1]);P=le.newItemFn?n(le.newItemFn):function(e,t){return(B(t)||{}).newItemModel||t.$query},!le.cleanModel||se&&!ce||o.addClass("cleanMode");var be=s.bindFocusBlur(o,re);angular.isDefined(u.autofocus)&&r(function(){re[0].focus()}),angular.isDefined(u.readonly)&&re.attr("readonly",!0),angular.isDefined(u.tabindex)&&(re.attr("tabindex",u.tabindex),o[0].removeAttribute("tabindex")),le.maxlength&&re.attr("maxlength",le.maxlength),u.$observe("disabled",function(t){re.prop("disabled",t),$&&p.$modelValue&&p.$modelValue.length&&(e.inputHide=t)}),e.$on("$destroy",be),e.$parent.$watch(u.multipleLimit,function(e){b=Number(e)||1/0}),e.$parent.$watch(u.multiple,function(e){$=void 0===e?angular.isDefined(u.multiple):e,o[$?"addClass":"removeClass"]("multiple")}),e.$parent.$watch(u.ngModel,function(r,n){var o=Y(r),a=t.when(o);R(),J(n)&&r!==n&&m(),$||C(),L&&J(r)&&(a=X(null,r).then(function(e){return s.intersection(o,e,null,_)}),v=null),$&&u.disabled&&!J(r)&&(e.inputHide=!1),a.then(function(t){e.output=t,t.length!==o.length&&e.removeItem(t.length)})}),e.$watch("query",function(t,r){U(t.slice(0,-1),t.slice(-1))||(t===r||e.oldQuery&&!t||g||(ne[0].scrollTop=0,t?(X(t),e.oldQuery=null):$&&(Z(),g=!0)),g=!1)}),e.$watch("groups",function(t){s.groupsIsEmpty(t)?e.isOpen=!1:e.isOpen||u.disabled||(e.isOpen=!0,e.isFocused=!0)}),e.$watch("isFocused",function(e){l[e?"addClass":"removeClass"](o,"focused",!Q&&{tempClasses:"focused-animate"})}),e.$watch("isOpen",function(e){l[e?"addClass":"removeClass"](o,"open",!Q&&{tempClasses:"open-animate"})}),e.$watch("showLoader",function(e){l[e?"addClass":"removeClass"](o,"loading",!Q&&{tempClasses:"loading-animate"})}),e.addItem=function(t){if(w=e.query,!$||!s.intersection(e.output,[t],F,F).length){if(e.output.length>=b)return void d("limited");var r=e.groups[j(t)]=e.groups[j(t)]||[],n=L?_(t):t;r.splice(r.indexOf(t),1),$?p.$setViewValue(angular.isArray(p.$modelValue)?p.$modelValue.concat(n):[n]):(p.$setViewValue(n),C()),s.groupsIsEmpty(e.groups)&&(e.groups={}),$||le.closeList||Z({query:!0}),m(),e.oldQuery=e.oldQuery||e.query,e.query="",e.backspaceFocus=!1}},e.removeItem=function(r){u.disabled||$&&0>r||(y=$?p.$modelValue[r]:p.$modelValue,t.when(me(e.$parent,{$item:y})).then(function(){($||e.inputHide)&&($?(p.$modelValue.splice(r,1),p.$setViewValue([].concat(p.$modelValue))):(I(),le.cleanModel&&p.$setViewValue(void 0)),!$&&e.backspaceFocus||(e.query=pe(y,w,G,ce,o)||""),$&&le.closeList&&Z({query:!0}))}))},e.setSelection=function(t){h||e.selectorPosition===t?h=!1:ee(ne,t)},e.keyUp=function(t){switch(t.keyCode){case 8:e.query.length||$&&e.output.length||Z()}},e.keyDown=function(t){var r=0,n=e.order.length-1;switch(t.keyCode){case 38:e.selectorPosition=angular.isNumber(e.selectorPosition)?e.selectorPosition:r,ee(ne,e.selectorPosition===r?n:e.selectorPosition-1),h=!0;break;case 40:e.selectorPosition=angular.isNumber(e.selectorPosition)?e.selectorPosition:r-1,ee(ne,e.selectorPosition===n?r:e.selectorPosition+1),h=!0,e.query.length||e.isOpen||X(),e.inputHide&&I();break;case 37:case 39:break;case 9:U("tab");break;case 13:U("enter"),t.preventDefault();break;case 32:U("space");break;case 27:$||(C(),le.cleanModel&&p.$setViewValue(y)),Z();break;case 8:if(!e.query.length){if($&&!se||(e.backspaceFocus=!0),e.backspaceFocus&&e.output&&(!$||e.output.length)){e.removeItem(e.output.length-1),se&&t.preventDefault();break}e.backspaceFocus=!e.backspaceFocus;break}default:return e.inputHide&&I(),e.backspaceFocus=!1,!1}},e.getSearchLabel=function(t){var r=G(t);return de(r,e.oldQuery||e.query,t,fe(e.$parent),o)},e.getDropdownLabel=function(t){var r=G(t);return he(r,e.oldQuery||e.query,t,ge(e.$parent),o)},e.getGroupLabel=function(t,r){return ye(t,e.oldQuery||e.query,r,$e(e.$parent),o)},e.getDisableWhen=W,Z(),o[0].addEventListener("click",x,!0),o.on("focus",k),o.on("blur",T)}}}}]),angular.module("oi.select").filter("oiSelectGroup",["$sce",function(e){return function(t){return e.trustAsHtml(t)}}]).filter("oiSelectCloseIcon",["$sce",function(e){return function(t){var r='<span class="close select-search-list-item_selection-remove">×</span>';return e.trustAsHtml(t+r)}}]).filter("oiSelectHighlight",["$sce","oiSelectEscape",function(e,t){return function(r,n){var o;return n.length>0||angular.isNumber(n)?(r=r.toString(),n=t(n.toString()),o=r.replace(new RegExp(n,"gi"),"<strong>$&</strong>")):o=r,e.trustAsHtml(o)}}]).filter("oiSelectAscSort",["oiSelectEscape",function(e){function t(t,r,n,o){var a,i,l,s,c=[],u=[],p=[],m=[];if(r){for(r=e(String(r)),a=0,l=!1;a<t.length;a++){if(l=n(t[a]).match(new RegExp(r,"i")),!l&&o&&(o.length||o.fields))for(i=0;i<o.length&&!l;i++)l=String(t[a][o[i]]).match(new RegExp(r,"i"));l&&c.push(t[a])}for(a=0;a<c.length;a++)n(c[a]).match(new RegExp("^"+r,"i"))?u.push(c[a]):p.push(c[a]);if(s=u.concat(p),o&&(o===!0||o.all)){e:for(a=0;a<t.length;a++){for(i=0;i<s.length;i++)if(t[a]===s[i])continue e;m.push(t[a])}s=s.concat(m)}}else s=[].concat(t);return s}return t}]).filter("none",function(){return function(e){return e}}),angular.module("oi.select").run(["$templateCache",function(e){e.put("src/template.html",'<div class=select-search><ul class=select-search-list><li class="btn btn-default btn-xs select-search-list-item select-search-list-item_selection" ng-hide=listItemHide ng-repeat="item in output track by $index" ng-class="{focused: backspaceFocus && $last}" ng-click=removeItem($index) ng-bind-html=getSearchLabel(item)></li><li class="select-search-list-item select-search-list-item_input" ng-class="{\'select-search-list-item_hide\': inputHide}"><input autocomplete=off ng-model=query ng-keyup=keyUp($event) ng-keydown=keyDown($event)></li><li class="select-search-list-item select-search-list-item_loader" ng-show=showLoader></li></ul></div><div class=select-dropdown ng-show=isOpen><ul ng-if=isOpen class=select-dropdown-optgroup ng-repeat="(group, options) in groups"><div class=select-dropdown-optgroup-header ng-if="group && options.length" ng-bind-html="getGroupLabel(group, options)"></div><li class=select-dropdown-optgroup-option ng-init="isDisabled = getDisableWhen(option)" ng-repeat="option in options" ng-class="{\'active\': selectorPosition === groupPos[group] + $index, \'disabled\': isDisabled, \'ungroup\': !group}" ng-click="isDisabled || addItem(option)" ng-mouseenter="setSelection(groupPos[group] + $index)" ng-bind-html=getDropdownLabel(option)></li></ul></div>')}]),angular.module("dbonyx").controller("forumCtrl",["$scope","forumService",function(e,t){t.getCategories(function(t,r){t?e.error=t:e.categories=r})}]).controller("forumCatCtrl",["$scope","$routeParams","$route","forumService","onyxUser",function(e,t,r,n,o){e.categoryId=t.categoryId,e.user=o,n.getCategory(e.categoryId,function(t,r){t?e.error=t:(e.category=r,e.category.threads.forEach(function(e){e.lastMessage=new Date(e.posts[e.posts.length-1].createdOn).toLocaleString()}))}),e.newThread=function(){e.error=!1,n.newThread(e.categoryId,e.title,e.message,function(t,n){t&&(e.error=t),n&&r.reload()})}}]).controller("forumThreadCtrl",["$scope","$routeParams","$route","forumService","onyxUser",function(e,t,r,n,o){e.threadId=t.threadId,e.user=o,n.getThread(e.threadId,function(t,r){t?e.error=t:e.thread=r}),e.postMessage=function(){e.error=!1,n.postMessage(e.threadId,e.message,function(t,n){t&&(e.error=t),n&&r.reload()})},e.editOn=function(t){var r=e.thread.posts[t];r.editText=r.message,r.editing=!0},e.editOff=function(t){e.thread.posts[t].editing=!1},e.submitEdit=function(t){var o=e.thread.posts[t];n.editPost(o._id,o.editText,function(e,t){o.editing=!1,r.reload()})}}]).controller("forumAdminCtrl",["$scope","$location","$route","onyxUser","forumService",function(e,t,r,n,o){n.getPrivateProfile(function(r,n){!r&&n&&1===n.userLevel||t.path("/forums"),e.user=n}),o.getCategories(function(t,r){t||!r?e.categories=!1:e.categories=r}),e.subCategory=[],e.topCategory={name:""},e.createTopCategory=function(){var t=e.topCategory.name;o.createTopCategory(t,function(t,n){return t?void(e.error=t):void r.reload()})},e.createSubCategory=function(t,n){var a=e.subCategory[n]||"";o.createSubCategory(a,t,function(t,n){return t?void(e.error=t):void r.reload()})}}]).controller("siteNewsCtrl",["$scope","forumService",function(e,t){t.getSiteNews(function(t,r){t||!r?e.error=t:(e.news=r,e.news.threads.forEach(function(e){e.replyCount=e.posts.length-1,e.postDate=new Date(e.posts[0].createdOn).toDateString()}))})}]).factory("forumService",["$http","Auth",function(e,t){var r={};return r.getCategories=function(t){e({url:"/api/forum/categories"}).then(function(e){t(null,e.data)},function(e){t(e.data.error)})},r.getCategory=function(t,r){e({url:"/api/forum/category/"+t}).then(function(e){r(null,e.data)},function(e){r(e.data.error)})},r.getThread=function(t,r){e({url:"/api/forum/thread/"+t}).then(function(e){r(null,e.data)},function(e){r(e.data.error)})},r.newThread=function(t,r,n,o){e({method:"POST",url:"/api/forum/category/"+t,
data:{title:r,message:n}}).then(function(e){o(null,e.data)},function(e){o(e.data.error)})},r.postMessage=function(t,r,n){e({method:"POST",url:"/api/forum/thread/"+t,data:{message:r}}).then(function(e){n(null,e.data)},function(e){n(e.data.error)})},r.createTopCategory=function(t,r){e({method:"POST",url:"/api/forum/category/",data:{name:t}}).then(function(e){r(null,e.data)},function(e){r(e.data.error)})},r.createSubCategory=function(t,r,n){e({method:"POST",url:"/api/forum/subcategory/",data:{name:t,id:r}}).then(function(e){n(null,e.data)},function(e){n(e.data.error)})},r.getSiteNews=function(t){e({url:"/api/forum/sitenews/"}).then(function(e){t(null,e.data)},function(e){t(e.data.error)})},r.editPost=function(t,r,n){console.log(),e({url:"/api/forum/post/"+t,method:"POST",data:{text:r}}).then(function(e){n(null,e.data)},function(e){console.log(e.data.error),n(e.data.error)})},r}]),angular.module("ItemCtrls",[]).factory("itemService",["$http",function(e){var t={};return t.getItem=function(r,n,o){var a=parseInt(r);return t.id===a?void o(t):void e({method:"GET",url:"/api/item/pretty/"+a,modifiers:n}).then(function(e){var t=e.data.item;o(t)},function(e){o(!1)})},t.prettify=function(e){},t}]).factory("itemAuctionService",["$http",function(e){var t={};return t.getItemAuctionDetails=function(t,r,n){e({method:"GET",url:"/api/auction/item/",params:{realm:r,id:t}}).then(function(e){n(!0)},function(e){n(!1)})},t}]).controller("itemCtrl",["$scope","$routeParams","itemService","itemAuctionService",function(e,t,r,n){e.id=t.id,e.auctionData=null,e.realmInput="",e.getItem=function(){e.item="Loading",e.loading=!0,r.getItem(e.id,{},function(t){e.item=t,e.loading=!1})},e.getAuctionDetails=function(){e.auctionLoading=!0,n.getItemAuctionDetails(e.id,e.realmInput,function(e){})},e.getItem()}]).directive("itemDisplay",function(){var e=["$scope","itemService",function(e,t){e.getItem=function(){e.item="Loading",e.loading=!0,t.getItem(e.itemId,{},function(t){e.item=t,e.loading=!1})},e.getItem()}];return{controller:e,restrict:"E",replace:!0,scope:{itemId:"@"},templateUrl:"app/templates/itemDisplay.html"}}).directive("itemLink",[function(){var e=["$scope",function(e){e.itemLinkPath="/item/"+(e.item.itemId||0);var t=[];"0"!==e.rand&&t.push("rand="+e.rand),t.length&&(e.itemLinkPath+="?",t.forEach(function(r,n){e.itemLinkPath+=r,n<t.length-1&&(e.itemLinkPath+="&")})),e.quantity&&1!==parseInt(e.quantity)&&(e.showQuantity=!0)}];return{controller:e,scope:{item:"=",quantity:"@",rand:"@"},replace:!0,templateUrl:"app/templates/itemLink.html"}}]),angular.module("dbonyx").directive("sidebar",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/sidebar.html"}}]).directive("mainContent",[function(){return{restrict:"E",replace:!0,transclude:!0,templateUrl:"app/templates/mainContent.html"}}]).directive("onyxFooter",[function(){return{templateUrl:"app/templates/footer.html"}}]).directive("selectOnFocus",["$window",function(e){return{restrict:"A",link:function(t,r,n){r.on("focus",function(){e.getSelection().toString()||this.setSelectionRange(0,this.value.length)})}}}]).directive("autoComplete",[function(){var e=["onyxPersistence","$scope","realmService",function(e,t,r){t.realmInputSelected=!1,t.realms=r.realms,t.blurIn=function(e){0==t.realms.length&&t.getRealms(),t[e]=!0},t.blurOut=function(e){t[e]=!1},t.getRealms=function(){r.getRealms(function(){t.realms=r.realms})},t.selectRealm=function(r){t.realmInput=r,e.setRealm(r),setTimeout(t.search,0)},t.hover=function(e){t.hoverIndex=e}}];return{restrict:"E",replace:!0,scope:{realmInput:"=",search:"&"},templateUrl:"app/templates/autoComplete.html",controller:e}}]).directive("money",function(){var e=["$scope",function(e){e.amount=parseInt(e.amount),e.copper=e.amount%100,e.silver=parseInt(e.amount/100)%100,e.gold=parseInt(e.amount/1e4)}];return{restrict:"E",replace:!0,scope:{amount:"="},templateUrl:"app/templates/money.html",controller:e}}),angular.module("dbonyx").factory("realmService",["$http",function(e){var t={};return t.realms=[],t.getRealms=function(r){return t.realms.length?r():(t.realms=["Loading Realms"],void e({method:"GET",url:"/api/realms"}).then(function(e){t.realms=e.data,r()},function(e){t.realms=["Unable to Load Realms"],r()}))},t}]),angular.module("MenuCtrls",[]).controller("MenuCtrl",["$scope",function(e){}]).directive("menuBar",[function(){var e=["$scope",function(e){var t;e.rehover=function(){e.hover=!0},e.menus=[],this.off=e.off=function(){e.hover=!1,t=setTimeout(function(){e.hover||(e.menuSelected=!1,e.$apply())},500)},this.addMenu=function(t){e.menus.push(t)}}];return{restrict:"E",transclude:!0,scope:{},controller:e,templateUrl:"app/templates/menuBar.html"}}]).directive("menu",[function(){return{require:"^^menuBar",restrict:"E",transclude:!0,scope:{title:"@",link:"@",icon:"@"},link:function(e,t,r,n){n.addMenu(e)},templateUrl:"app/templates/menu.html"}}]),angular.module("dbonyx").controller("privateProfileCtrl",["$scope","onyxUser",function(e,t){e.user=t,e.loading=!0,t.getPrivateProfile(function(t,r){e.loading=!1,e.profileData=r,e.error=t})}]).controller("publicProfileCtrl",["$scope","$routeParams","onyxUser",function(e,t,r){e.user=r,e.loading=!0,r.getPublicProfile(t.username,function(t,r){e.loading=!1,e.profileData=r,e.error=t})}]);