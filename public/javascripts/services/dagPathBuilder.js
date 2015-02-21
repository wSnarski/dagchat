dagchat.factory('dagPathBuilder', function() {
  var pathBuilder = {};
  var uniquePaths = {};
  //TODO expand this to allow for instantiating,
  //                              adding new ordered edges ..etc.
  return function(orderedEdges) {
    //set up for iterating
    pathBuilder[orderedEdges[0].in] = [[orderedEdges[0].in]];
    pathBuilder[orderedEdges[0].in][0].final = true;
    //iterate
    for(var i = 0; i < orderedEdges.length; i++) {
      var fromId = orderedEdges[i].in;
      var toId = orderedEdges[i].out;
      //assuming this always exists.
      //copy the array at the in,
      //set every final of the array at in to false
      //copy the array to the out array (make or add)
      if(!(toId in pathBuilder)) {
        pathBuilder[toId] = [];
      }
      var toPathOffset = pathBuilder[toId].length;
      for(var j = 0;
        j < pathBuilder[fromId].length;
        j++) {
          pathBuilder[toId].push(pathBuilder[fromId][j].slice(0));
          pathBuilder[fromId][j].final = false;
          pathBuilder[toId][toPathOffset + j].push(toId);
          pathBuilder[toId][toPathOffset + j].final = true;
        }
      }
      //TODO optimize this?
      //do this during the above loop?
      //do this final thing differently in general?
      var pathKeys = Object.keys(pathBuilder);
      for(var i = 0; i < pathKeys.length; i++) {
        for(var j = 0; j < pathBuilder[pathKeys[i]].length; j++) {
          if(pathBuilder[pathKeys[i]][j].final === true) {
            if(!(pathKeys[i] in uniquePaths)) {
              uniquePaths[pathKeys[i]] = [];
            }
            uniquePaths[pathKeys[i]].push(pathBuilder[pathKeys[i]][j]);
          }
        }
      }
      return uniquePaths;
    };
  });
