define(["Class", "Generator", "libs/lodash.min"], function(Class, Generator, _){
	var Point = Class.create({
		init: function(x, y){
			this.x = x;
			this.y = y;
		},
		distanceTo: function(p2){
			var p1 = this;
			return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
		},
		toString: function(){
			return "(x: " + this.x + ", y: " + this. y + ")";
		},
		static: {
			random: function(x, y, num){
				if(!num)	num = 1;
				return _.times(num, function(){
					return new Point(_.random(x[0], x[1], true), _.random(y[0], y[1], true));
				});
			},
			centroid: function(listOfPoints){
				var x = 0, y = 0;
				for(var i = 0; i < listOfPoints.length; i++){
					x += listOfPoints[i].x;
					y += listOfPoints[i].y;
				}
				x /= listOfPoints.length;
				y /= listOfPoints.length;
				return new Point(x, y);
			}
		}
	});

	var kMeans = Class.create({
		static: {
			generate: function(points, size){
				var initialCentroids = _.sampleSize(points, size);
				var initialGroups = kMeans.groupPointsByCentroids(points, initialCentroids);
				return new Generator(initialGroups, function(partitions){
					// recalculate centroid
					var groups = partitions.values();
					var newCentroids = [];
					for(var group of groups){
						newCentroids.push(Point.centroid(group));
					}

					return kMeans.groupPointsByCentroids(points, newCentroids);
				});
			},
			groupPointsByCentroids: function(points, centroids){
				var groups = new Map(centroids.map(function(centroid){
					return [centroid, []]; 
				}));
				points.forEach(function(point){
					var groupCentroid = _.minBy(centroids, function(centroid){
						return centroid.distanceTo(point);
					});

					groups.get(groupCentroid).push(point);
				});
				return groups;
			}
		}
	});

	var DBSCAN = Class.create({
		static: {
			generate: function(points, epsilon, minPts){
				// Sort points
				var sorted = DBSCAN.sortPoints(points);
				// Number of points
				var numPoints = points.length;
				// initial point index
				var i = 0;
				// Initialize points
				points.forEach(function(point){
					point.visited = false;
					point.cluster = null;
				});
				// Initialize clusters
				var noiseCluster = {};

				function addPointToCluster(cluster, point){
					if(!cluster){
						cluster = {};
					}
					point.cluster = cluster;

					return cluster;
				}

				return new Generator(undefined, function(){
					if(i >= numPoints)	throw new Generator.DoneException();
					var point = points[i];
					// Continue if visited
					while(point.visited){
						i += 1;
						if(i >= numPoints)	throw new Generator.DoneException();
						point = points[i];
					}
					// Increase index
					i += 1;
					// Mark P as visited
					point.visited = true;
					// Get neighbors
					var neighborPts = DBSCAN.getNearestNeighbors(sorted, point, epsilon);
					if(neighborPts.size < minPts){
						// Mark P as noise
						addPointToCluster(noiseCluster, point);
					}else{
						var newCluster = addPointToCluster(undefined, point);
						DBSCAN.expandCluster(sorted, neighborPts, newCluster, epsilon, minPts);
					}
					return DBSCAN.groupPointsByClusters(points);
				});
			},
			expandCluster: function(sorted, neighborPts, cluster, epsilon, minPts){
				for(var neighborPt of neighborPts){
					if(!neighborPt.visited){
						neighborPt.visited = true;
						var neighborNeighborPts = DBSCAN.getNearestNeighbors(sorted, neighborPt, epsilon);
						if(neighborNeighborPts.size >= minPts){
							// Join
							for (var neighborNeighborPt of neighborNeighborPts) {
								neighborPts.add(neighborNeighborPt);
							}
						}
					}
					if(neighborPt.cluster == null){
						neighborPt.cluster = cluster;
					}
				}
			},
			sortPoints: function(points){
				return {
					byX: points.slice().sort(function(a, b){ return a.x - b.x }),
					byY: points.slice().sort(function(a, b){ return a.y - b.y }),
				};
			},
			getNearestNeighbors: function(sorted, point, epsilon){
				// Find indices
				var indexX = _.sortedIndexBy(sorted.byX, point, function(point){ return point.x; });

				var neighbors = [point];

				var x = indexX;
				while(true){
					x--;
					var checkingPoint = sorted.byX[x];
					if(x < 0)                                    	break;
					if(point.x - checkingPoint.x > epsilon)      	break;
					if(point.distanceTo(checkingPoint) > epsilon)	continue;
					neighbors.push(checkingPoint);
				}

				x = indexX;
				while(true){
					x++;
					var checkingPoint = sorted.byX[x];
					if(x >= sorted.byX.length)                   	break;
					if(checkingPoint.x - point.x > epsilon)      	break;
					if(point.distanceTo(checkingPoint) > epsilon)	continue;
					neighbors.push(checkingPoint);
				}

				return new Set(neighbors);
			},
			groupPointsByClusters: function(points){
				var map = new Map();
				for(var i = 0; i < points.length; i++){
					var point = points[i];
					if(!map.has(point.cluster)){
						map.set(point.cluster, []);
					}
					map.get(point.cluster).push(point);
				}
				return map;
			}
		}
	});


	return {
		kMeans: kMeans,
		DBSCAN: DBSCAN,
		Point: Point
	};
});