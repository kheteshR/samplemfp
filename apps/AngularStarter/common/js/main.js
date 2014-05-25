(function(){
	var app = angular.module('AngularStarterApp', ["ngSanitize"]);

	app.controller("ApplicationController", function($scope, $sce){
		var l = WL.Logger.create({pkg:"ApplicationController"});
		var _this = this;
		
		var currentPageId = 1;
		this.feeds = [];
		this.currentFeed = {};
		
		this.changePage = function (pageId){
			currentPageId = pageId;
		};
		
		this.shouldDisplay = function(pageId){
			return pageId === currentPageId;
		};
		
		this.renderHtml = function(){
			return $sce.trustAsHtml(_this.currentFeed.description);
		};
		
		this.onFeedItemClicked = function(feedId){
			this.currentFeed = this.feeds[feedId];
			currentPageId=2;
		};
		
		wlInitOptions.onSuccess = function(){
			l.debug("wlInitOptions.onSuccess");
			
			var invocationOptions = {
					adapter: "NewsAdapter", 
					procedure: "getStories",
					parameters: []
			};
			
			WL.Client.invokeProcedure(invocationOptions, {
				onSuccess: onGetStoriesSuccess,
				onFailure: onGetStoriesFailure
			});
		};
		
		function onGetStoriesSuccess(data){
			l.debug("onGetStoriesSuccess");
			_this.feeds = data.invocationResult.Items;
			$scope.$apply();
		}
		
		function onGetStoriesFailure(data){
			l.debug("onGetStoriesFailure");
		}
		
		$scope.username="";

		var challengeHandler = new WL.Client.createChallengeHandler();
		challengeHandler.isCustomResponse = function(resp){
			if (resp && resp.responseJSON && typeof (resp.responseJSON.authStatus) === "string"){
				return true;
			} else {
				return false;
			}
		};
		
		challengeHandler.handleChallenge = function(resp){
			var authStatus = resp.responseJSON.authStatus;
			if (authStatus === "required"){
				_this.changePage(3);
				$scope.username = "";
			} else if (authStatus === "complete"){
				_this.changePage(1);
				challengeHandler.submitSuccess();
			}
			$scope.$apply();
		};
		
		
		this.submitButtonClicked = function(){
			l.debug("submitButtonClicked. username :: " + $scope.username);
			var invocationData = {
					adapter: "NewsAdapter", 
					procedure: "submitAuth",
					parameters : [$scope.username]
			};
			challengeHandler.submitAdapterAuthentication(invocationData, {});
		};
		  
		WL.Client.init(wlInitOptions);
	});
	
	app.directive('feedsPage', function(){
		return {
			restrict: 'E', 
			templateUrl: 'feeds-page.html'
		};
	});
	
	app.directive('detailsPage', function(){
		return {
			restrict: 'E', 
			templateUrl: 'details-page.html'
		};
	});

	app.directive('loginPage', function(){
		return {
			restrict: 'E', 
			templateUrl: 'login-page.html'
		};
	});
}());