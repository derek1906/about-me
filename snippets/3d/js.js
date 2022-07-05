var scene, scene2, animation;

window.addEventListener("load", function(){

	var camera = new Camera([-0.2, 3, 6], [0,0,0], 1.25);
	var camera2 = new Camera([0.2, 3, 6], [0,0,0], 1.25);

	var cube = new Cube([0, 1, 0], [2, 2, 2]),
		table = Shape.get([[5, 0, 5], [-5, 0, 5], [-5, 0, -5], [5, 0, -5]]);

	var triangle1 = Shape.get([[3, 0, 4], [2, 0, 2], [1, 0, 3]]),
		triangle2 = Shape.get([[-3, 0, -4], [-2, 0, -2], [-1, 0, -3]]),
		triangle3 = Shape.get([[-3, 0, 4], [-2, 0, 2], [-1, 0, 3]]),
		triangle4 = Shape.get([[3, 0, -4], [2, 0, -2], [1, 0, -3]]);

	scene = new Scene(camera, [350, 350]);
	scene.add(cube).add(table);
	scene.add(triangle1).add(triangle2).add(triangle3).add(triangle4);

	scene2 = new Scene(camera2, [350, 350]);
	scene2.objects = scene.objects;

	scene.appendTo(document.body);
	scene2.appendTo(document.body);

	addEvents();

	draw();
});

function draw(){
	animation = requestAnimationFrame(draw);

	scene.rotateY(0.01);
	scene2.rotateY(0.01);
	scene.draw();
	scene2.draw();

}

function addEvents(){
	document.querySelector("#toggle").addEventListener("click", function(){
		if(animation == -1){
			draw();
		}else{
			cancelAnimationFrame(animation);
			animation = -1;
		}
	});

	var scaling = {
		factor: 0,
		prevFactor: 1,
		mousedown: false,
		originY: 0
	};
	document.querySelector("canvas").addEventListener("mousedown", function(e){
		scaling.mousedown = true;
		scaling.originY = e.clientY;
	});
	window.addEventListener("mousemove", function(e){
		if(scaling.mousedown){
			var dY = e.clientY - scaling.originY;
			scaling.factor = dY/200;
			scene.scale(scaling.factor + scaling.prevFactor);
		}
	});
	window.addEventListener("mouseup", function(e){
		scaling.mousedown = false;
		scaling.prevFactor += scaling.factor;
	})
}