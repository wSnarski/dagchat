describe('DAG path builder test', function() {
  beforeEach(module('dagchat'));
  var dagPathBuilder;
  beforeEach(inject(function($rootScope, _dagPathBuilder_){
    scope = $rootScope.$new();
    dagPathBuilder = _dagPathBuilder_;
  }));

  it('should build unique paths from ordered edges', function(){
    //dagPathBuilder([]);
  });
});
