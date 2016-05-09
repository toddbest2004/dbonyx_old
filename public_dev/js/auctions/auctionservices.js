angular.module('AuctionCtrls')
.factory('auctionService', ['$http','itemConstants',function($http,itemConstants){
	var auction = {
		searchTerm: '',
		realmInput: '',
		filters: [],
		qualities:[],
		sortBy: 'buyout',
		sortOrder: -1,
		resultPages: 0,
		currentPage: 1,
		resultHigh:0,
		resultLow:0,
		limit: 25,
		loading: false,
		auctionResults: false
	}
	auction.setSearchTerm = function(term){
		auction.searchTerm = term
	}
	auction.setRealm = function(realm){
		auction.realmInput = realm
	}
	auction.noMatch=function(){
		auction.loading=false
		auction.auctionResults=[]
		auction.resultPages = 0
		auction.resultLow = 0
		auction.resultHigh = 0
	}
	auction.search = function(callback){
		if(!auction.realmInput.length){
			auction.noMatch()
			callback(false)
			return
		}
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {
				'qualities[]':auction.qualities,
				'filters[]':auction.filters,
				searchTerm:auction.searchTerm, 
				realm:auction.realmInput,
				offset:(auction.currentPage-1)*auction.limit,
				limit:auction.limit,
				sortBy:auction.sortBy,
				sortOrder:auction.sortOrder
			}
		}).then(function success(response){
			auction.loading=false
			auction.auctionResults=response.data
			auction.resultPages = Math.ceil(auction.auctionResults.count/auction.limit)
			auction.resultLow = (auction.currentPage-1)*auction.limit
			auction.resultHigh = auction.resultLow+auction.auctionResults.auctions.length 
			callback(true)
		}, function error(response){
			auction.noMatch()
			// console.log(response)
			callback(false)
		})
	}
	auction.setSortBy=function(sort){
		if(auction.sortBy===sort){//if clicking on same column, reverse the order
			auction.sortOrder*=-1
		}else{//otherwise set it
			auction.sortBy=sort
			auction.sortOrder=-1
		}
	}
	auction.updatePage = function(page){
		page=parseInt(page)
		if(page>auction.resultPages){
			page=auction.resultPages
		}
		if(page<1){
			page=1
		}
		auction.currentPage=page
	}
	auction.firstPage = function(){ 
		auction.updatePage(1)
	}
	auction.backPage = function(){
		auction.updatePage(auction.currentPage-1)
	}
	auction.nextPage = function(){
		auction.updatePage(auction.currentPage+1)
	}
	auction.lastPage = function(){
		auction.updatePage(auction.resultPages)
	}

	return auction
}])
.factory('auctionHistory',['$http',function($http){
	var history = {}
	history.search = function(item, realmInput, cb){
		$http({
			method: 'GET',
			url: '/api/auction/auctionHistory',
			params: {
				item:item,
				realm: realmInput
			}
		}).then(function success(response){
			cb(null,response.data)
		}, function error(response){
			cb(response.data,null)
		})
	}
	return history
}])