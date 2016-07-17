angular.module('AuctionCtrls')
.factory('auctionService', ['$http',function($http){
	var auction = {
		searchTerm: '',
		realmInput: '',
		filters: [],
		qualities:[],
		sortBy: 'buyout',
		sortOrder: -1,
		// resultPages: 0,
		// currentPage: 1,
		// resultHigh:0,
		// resultLow:0,
		// limit: 25,
		loading: false,
		settings: {
			limit: 25,
			offset: 0
		},
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
		auction.settings.count=0;
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
				offset:auction.settings.offset,
				limit:auction.settings.limit,
				sortBy:auction.sortBy,
				sortOrder:auction.sortOrder
			}
		}).then(function success(response){
			auction.loading=false
			auction.auctionResults=response.data
			auction.settings.count=response.data.count;
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
	};

	return auction;
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