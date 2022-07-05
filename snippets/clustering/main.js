/**
 * Not using Babel due to terrible performance.
 */

requirejs.config({
  paths: {
    libs: "./libs",
  },
});

require(["Clustering", "libs/pixi.min", "libs/dat.gui.min"], function (
  Clustering,
  PIXI,
  dat
) {
  PIXI.utils.skipHello();

  var app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    autoResize: true,
    resolution: window.devicePixelRatio,
  });
  document.body.appendChild(app.view);

  app.renderer.view.style.position = "absolute";
  app.renderer.view.style.display = "block";

  app.stage.interactive = true;

  // Set up controls
  var gui = new dat.GUI();
  var controls = {
    cycle: 0,
    points: [],
    colors: [],
    gen: null,
    points: [],

    period: 500,
    running: false,
    algorithm: "kMeans",

    numPartitions: 3,

    epsilon: Math.min(app.screen.width, app.screen.height) * 0.07,
    minPts: 2,

    randomize: function () {
      if (controls.running) return;

      // Generate 1000 points
      controls.points = Clustering.Point.random(
        [0, window.innerWidth],
        [0, window.innerHeight],
        1000
      );
      console.log("Created 1000 random points.", controls.points);
    },
    clear: function () {
      if (controls.running) return;
      controls.points = [];
      console.log("Reset points.");
    },
    log: function () {
      console.log(controls);
    },
  };
  gui.add(controls, "period", 100, 1000);
  gui.add(controls, "running").onFinishChange(function (running) {
    if (running) {
      app.stage.interactive = false;

      switch (controls.algorithm) {
        case "kMeans":
          controls.colors = pickColors(controls.numPartitions);
          controls.gen = Clustering.kMeans.generate(
            controls.points,
            controls.numPartitions
          );
          break;
        case "DBSCAN":
          controls.colors = pickColors(100);
          controls.gen = Clustering.DBSCAN.generate(
            controls.points,
            controls.epsilon,
            controls.minPts
          );
          break;
      }
    } else {
      app.stage.interactive = true;
      controls.gen = null;
      controls.cycle = 0;
    }
  });
  gui.add(controls, "algorithm", ["kMeans", "DBSCAN"]);

  var kMeansGui = gui.addFolder("K-means(k)");
  kMeansGui.add(controls, "numPartitions", 1, 10).step(1);
  kMeansGui.open();

  var DBSCANGui = gui.addFolder("DBSCAN(ε, minPts)");
  DBSCANGui.add(controls, "epsilon");
  DBSCANGui.add(controls, "minPts", 1, 5).step(1);
  DBSCANGui.open();

  gui.add(controls, "randomize");
  gui.add(controls, "clear");
  gui.add(controls, "log");

  var g = new PIXI.Graphics();
  app.stage.addChild(g);

  // Create text
  var text = new PIXI.Text(
    "",
    new PIXI.TextStyle({
      fill: 0xffffff,
    })
  );
  text.x = app.screen.width / 2;
  text.y = 0;
  text.anchor.set(0.5, 0);
  app.stage.addChild(text);

  // Event
  app.stage.hitArea = new PIXI.Rectangle(
    0,
    0,
    app.screen.width,
    app.screen.height
  );
  app.stage
    .on("pointerdown", function (event) {
      this.dragging = true;
      this.lastAdded = Date.now();
      controls.points.push(
        new Clustering.Point(event.data.global.x, event.data.global.y)
      );

      render();
    })
    .on("pointerup", function () {
      this.dragging = false;
    })
    .on("pointerupoutside", function () {
      this.dragging = false;
    })
    .on("pointermove", function (event) {
      if (!this.dragging) return;

      var lastAdded = this.lastAdded || 0,
        timeNow = Date.now();

      if (timeNow - lastAdded < 30) return;

      this.lastAdded = timeNow;
      controls.points.push(
        new Clustering.Point(event.data.global.x, event.data.global.y)
      );

      render();
    });

  // Start loop
  loop();

  function renderPoints(g, points) {
    g.clear();

    for (var i = 0; i < points.length; i++) {
      g.beginFill(0xffffff);
      g.drawCircle(points[i].x, points[i].y, 3);
      g.endFill();
    }
  }

  function renderPartition(g, partition) {
    g.clear();

    g.lineStyle(1, 0xffffff);

    var count = 0;
    for (var group of partition) {
      var centroid = group[0],
        points = group[1];

      var color = controls.colors[count];

      for (var i = 0; i < points.length; i++) {
        g.beginFill(color);
        g.drawCircle(points[i].x, points[i].y, 5);
        g.endFill();
      }

      count += 1;
    }
  }

  function render() {
    if (controls.running) {
      var state = controls.gen.next();
      if (state.done) {
        text.text = "Done";
      } else {
        renderPartition(g, state.value);
        controls.cycle += 1;
        text.text = "Cycle #" + controls.cycle;
      }
    } else {
      renderPoints(g, controls.points);
      text.text = "Click to add points";
    }

    app.render();
  }

  function loop() {
    setTimeout(loop, controls.period);
    render();
  }

  function pickColors(n) {
    var colors = [
      0x001f3f, 0x0074d9, 0x7fdbff, 0x39cccc, 0x3d9970, 0x2ecc40, 0x01ff70,
      0xffdc00, 0xff851b, 0xff4136, 0x85144b, 0xf012be, 0xb10dc9,
    ];
    return _.sampleSize(colors, n);
  }
});

function lerpColor(a, b, amount) {
  var ah = a,
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = b,
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);

  return ((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0;
}
