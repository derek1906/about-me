var Matrix = Class.create({
    /**
     * Initialize matrix with dimensions.
     * @param  {int} row
     * @param  {int} col
     */
    init: function(row, col){
        this.row = row;
        this.col = col;
        this.data = [];
        for(var r = 0; r < row; r++){
            var dataRow = this.data[r] = [];
            for(var c = 0; c < col; c++){
                dataRow[c] = 0;
            }
        }
    },
    static: {
        /**
         * Identity factory
         * @param  {int} dimension of identity matrix
         * @return {Matrix}
         */
        eye: function(dimension){
            var rtn = new Matrix(dimension, dimension);
            for(var i = 0; i < dimension; i++){
                rtn.set(i, i, 1);
            }
            return rtn;
        },
        /**
         * Ones matrix factory
         * @param  {int} number of rows
         * @param  {int} number of columns
         * @return {Matrix}
         */
        ones: function(rows, cols){
            var rtn = new Matrix(rows, cols);
            for(var x = 0; x < cols; x++){
                for(var y = 0; y < rows; y++){
                    rtn.set(y, x, 1);
                }
            }
            return rtn;
        }
    },
    /**
     * Override toString
     * @return {string}
     */
    toString: function(){
        var str = "[\n";
            for(var r = 0; r < this.row; r ++){
                var rowStr = "\t[\t";
                rowStr += this.data[r].join("\t");
                rowStr += "]\n";
                
                str += rowStr;
            }
        return str + "]";
    },
    /**
     * Get specific cell.
     * @param  {int} row
     * @param  {int} column
     * @return {int} Value at (row, column)
     */
    get: function(r, c){
        if(c === undefined){
            //1D
            return this.data[r][0];
        }else{
            return this.data[r][c];
        }
    },
    /**
     * Set a specific cell.
     * @param {int} row
     * @param {int} column
     */
    set: function(r, c, value){
        this.data[r][c] = value;
    },

    /**
     * Set a range of cells.
     * @param {1D or 2D array} input
     * @param {[row, column]}   startPos [Top left coords]
     * @param {boolean} vertical True if the 1d input matrix should be filled vertically
     */
    setRange: function(input, startPos, vertical){
        if(!input.length){
            //empty
            return this;
        }
        var rowSize, colSize;
        
        if(Array.isArray(input[0])){
            //2D
            rowSize = input.length;
            colSize = input[0].length;
            for(var row = startPos[0], y = 0; y < rowSize; row++, y++){
                for(var col = startPos[1], x = 0; x < colSize; col++, x++){
                    this.data[row][col] = input[y][x];
                }
            }
            return this;
        }else{
            //1D
            if(vertical){
                rowSize = input.length;
                for(var row = startPos[0], y = 0; y < rowSize; row++, y++){
                    this.data[row][startPos[1]] = input[y];
                }
            }else{
                colSize = input.length;
                for(var col = startPos[1], x = 0; x < colSize; col++, x++){
                    this.data[startPos[0]][col] = input[x];
                }
            }
            return this;
        }
    },
    getRange: function(dimension, startPos, vertical){
        var startRow = startPos[0],
            startCol = startPos[1];
        if(dimension.length == 1){
            //1D
            var output = [];
            if(vertical){
                for(var row = 0; row < dimension; row++){
                    output.push(this.data[row + startRow][startCol]);
                }
            }else{
                for(var col = 0; col < dimension; col++){
                    output.push(this.data[startRow][col + startCol]);
                }
            }
            return output;
        }else{
            throw "not implemented";
        }
    },
    /**
     * Dot product.
     * @param  {Matrix} Another matrix
     * @return {Matrix} new Matrix
     */
    dot: function(n){
        var m = this;
        if(m.col != n.row){
            throw "Unmatched dimension";
        }
        var rtn = new Matrix(m.row, n.col);
        for(var r = 0; r < rtn.row; r++){
            for(var c = 0; c < rtn.col; c++){
                var sum = 0;
                for(var k = 0; k < m.col; k++){
                    sum += m.get(r, k) * n.get(k, c);
                }
                rtn.set(r, c, sum);
            }
        }
        return rtn;
    },
    /**
     * Transpose
     * @return {Matrix} new Matrix
     */
    T: function(){
        var rtn = new Matrix(this.col, this.row);
        for(var r = 0; r < this.row; r++){
            for(var c = 0; c < this.col; c++){
                rtn.set(c, r, this.get(r, c));
            }
        }
        return rtn;
    },
    subtract: function(B){
        var rtn = new Matrix(this.row, this.col);
        for(var row = 0; row < this.row; row++){
            for(var col = 0; col < this.col; col++){
                rtn.data[row][col] = this.data[row][col] - B.data[row][col];
            }
        }
        return rtn;
    },
    scale: function(scalar){
        var rtn = new Matrix(this.row, this.col);
        for(var row = 0; row < this.row; row++){
            for(var col = 0; col < this.col; col++){
                rtn.data[row][col] = this.data[row][col] * scalar;
            }
        }
        return rtn;
    },
    /**
     * Create a normalized vector.
     */
    normalize: function(){
        return this.scale(1/Vector.getLength(this));
    }
});

var Vector = Class.create({
    static: {
        /**
         * Create a Matrix based vector.
         * @param {float[3]} list A 3-tuple.
         */
        create: function(list){
            return new Matrix(list.length, 1).setRange(list, [0, 0], true);
        },
        /**
         * Cross product
         * @param {Matrix} v1
         * @param {Matrix} v2
         */
        cross: function(v1, v2){
            this.validateVector(v1);
            this.validateVector(v2);

            return Vector.create([
                    v1.get(1) * v2.get(2) - v2.get(1) * v1.get(2),
                    -v1.get(0) * v2.get(2) + v2.get(0) * v1.get(2),
                    v1.get(0) * v2.get(1) - v2.get(0) * v1.get(1)
                ]);
        },
        /**
         * Calculate length of a vector.
         * @param {Matrix} v Vector
         */
        getLength: function(v){
            this.validateVector(v);

            var sum = 0;
            for(var row = 0; row < 3; row++){
                sum += Math.pow(v.get(row, 0), 2);
            }
            return Math.sqrt(sum);
        },
        getList: function(v){
            return v.getRange([3], [0, 0], true);
        },
        validateVector: function(v){
            if(v.col != 1){
                throw "Not vectors";
            }
        }
    }
});


var Camera = Matrix.extends({
    /**
     * @param {float[3]} coords Camera position
     * @param {float[3]} lookat Lookat position
     * @param {float} d Distance to screen
     */
    init: function(coords, lookat, d){
        this._super(4, 1);
        this.setRange(coords, [0, 0], true);
        this.lookat = Vector.create(lookat);
        this.screenDistance = d;
    }
});


var VertexTransformer = Class.create({
    /**
     * Up vector
     * @type {Matrix}
     */
    up: Vector.create([0, 1, 0]),
    viewTransform: undefined,
    perspectiveTransform: undefined,
    /**
     * @param {Camera} camera Camera for the scene.
     */
    init: function(camera){
        this.camera = camera;
        
        this.viewTransform = this.getViewTransform();
        this.perspectiveTransform = this.getPerspectiveTransform();
    },
    /**
     * @param {Camera} camera Camera for the scene
     */
    getViewTransform: function(){
        var camera = this.camera,
            lookat = camera.lookat;
        var v = lookat.subtract(camera).normalize(),
            r = Vector.cross(v, this.up).normalize(),
            u = Vector.cross(r, v);

        var rotationTransform = Matrix.eye(4);
        rotationTransform.setRange(Vector.getList(r), [0, 0]);
        rotationTransform.setRange(Vector.getList(u), [1, 0]);
        rotationTransform.setRange(Vector.getList(v.scale(-1)), [2, 0]);

        var translationTransform = Matrix.eye(4);
        translationTransform.setRange(Vector.getList(camera.scale(-1)), [0, 3], true);

        console.log("R", rotationTransform+"");
        console.log("T", translationTransform+"");

        return rotationTransform.dot(translationTransform);
    },
    getPerspectiveTransform: function(){
        var camera = this.camera;

        var perspectiveTransform = Matrix.eye(4);
        perspectiveTransform.setRange([-1/camera.screenDistance, 0], [3, 2]);

        console.log("Perspective", perspectiveTransform+"");

        return perspectiveTransform;
    },
    applyTransform: function(v, additioanlTransform){
        if(additioanlTransform){
            v = additioanlTransform.dot(v);
        }
        var newVector = this.perspectiveTransform.dot(this.viewTransform.dot(v));
        newVector = newVector.scale(1/newVector.get(3));

        return [newVector.get(0,0), newVector.get(1,0)];
    },
    windowToCanvas: function(coords, dimensions){
        return [(coords[0] + 1) * dimensions[0]/2, dimensions[1] - (coords[1] + 1) * dimensions[1]/2];
    }
});


var Vertex = Class.create({
    /**
     * @param {float[3]} coords Vertex position
     */
    init: function(coords){
        this.matrix = Matrix.ones(4, 1).setRange(coords, [0, 0], true);
    }
});


var Shape = Class.create({
    vertices: undefined,
    closed: true,
    init: function(list, closed){
        this.vertices = list.slice();
        this.closed = closed || true;
    },
    draw: function(transformer, ctx, dimensions, additioanlTransform){
        var vertices = this.vertices.map(function(vertex){
            return transformer.applyTransform(vertex.matrix, additioanlTransform);
        });
        var first = transformer.windowToCanvas(vertices[0], dimensions);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(first[0], first[1]);
        for(var i = 1; i < vertices.length; i++){
            var vertex = transformer.windowToCanvas(vertices[i], dimensions);
            ctx.lineTo(vertex[0], vertex[1]);
        }
        this.closed && ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    static: {
        get: function(list, closed){
            for(var i = 0; i < list.length; i++){
                list[i] = new Vertex(list[i]);
            }
            return new Shape(list, closed);
        }
    }
});

var Cube = Class.create({
    sides: [],
    /**
     * @param {float[2]} origin The center of the cube.
     * @param {float[2]} size The size of the cube.
     */
    init: function(origin, size){
        var originX = origin[0],
            originY = origin[1],
            originZ = origin[2];
        var halfWidth = size[0]/2,
            halfHeight = size[1]/2,
            halfDepth = size[2]/2;
        var f0 = [originX + halfWidth, originY + halfHeight, originZ + halfDepth],
            f1 = [originX + halfWidth, originY - halfHeight, originZ + halfDepth],
            f2 = [originX - halfWidth, originY - halfHeight, originZ + halfDepth],
            f3 = [originX - halfWidth, originY + halfHeight, originZ + halfDepth],
            b0 = [originX + halfWidth, originY + halfHeight, originZ - halfDepth],
            b1 = [originX + halfWidth, originY - halfHeight, originZ - halfDepth],
            b2 = [originX - halfWidth, originY - halfHeight, originZ - halfDepth],
            b3 = [originX - halfWidth, originY + halfHeight, originZ - halfDepth];

        var sides = this.sides;
        //top
        sides.push(Shape.get([f0, f3, b3, b0]));
        //bottom
        sides.push(Shape.get([f1, f2, b2, b1]));
        //front
        sides.push(Shape.get([f0, f1, f2, f3]));
        //back
        sides.push(Shape.get([b0, b1, b2, b3]));
        //right
        sides.push(Shape.get([f0, f1, b1, b0]));
        //left
        sides.push(Shape.get([f3, f2, b2, b3]));
    },
    draw: function(transformer, ctx, dimensions, additioanlTransform){
        for(var i = 0; i < this.sides.length; i++){
            this.sides[i].draw(transformer, ctx, dimensions, additioanlTransform);
        }
    }
});


var Scene = Class.create({
    objects: [],
    transformer: undefined,
    camera: undefined,
    ctx: undefined,
    canvas: undefined,
    dimensions: [300, 300],
    additioanlTransform: Matrix.eye(4),
    t_scale: Matrix.eye(4),

    init: function(camera, dimensions){
        dimensions = dimensions ? dimensions : [300, 300];

        this.canvas = document.createElement("canvas");

        this.transformer = new VertexTransformer(camera);
        this.camera = camera;
        this.ctx = this.canvas.getContext("2d");
        this.dimensions = dimensions;

        this.canvas.width = dimensions[0];
        this.canvas.height = dimensions[1];

    },
    add: function(drawable){
        this.objects.push(drawable);
        return this;
    },
    draw: function(){
        this.ctx.clearRect(0, 0, 500, 500);
        var combinedTransformation = this.t_scale.dot(this.additioanlTransform);
        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].draw(this.transformer, this.ctx, this.dimensions, combinedTransformation);
        }
    },
    appendTo: function(ele){
        ele.appendChild(this.canvas);
    },
    rotateY: function(rad){
        var rotation = Matrix.eye(4);
        var cos = Math.cos(rad),
            sin = Math.sin(rad);
        rotation.set(0, 0, cos);
        rotation.set(2, 0, sin);
        rotation.set(0, 2, -sin);
        rotation.set(2, 2, cos);

        this.additioanlTransform = rotation.dot(this.additioanlTransform);
    },
    scale: function(factor){
        var scale = this.t_scale
        scale.set(0,0, factor);
        scale.set(1,1, factor);
        scale.set(2,2, factor);
    }
});