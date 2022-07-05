define(["Class"], function(Class){
	var Generator = Class.create({
		init: function(initValue, nextFunc){
			this.prevValue = initValue;
			this.nextFunc = nextFunc;
			this.ended = false;
		},
		next: function(){
			if(this.ended)	return {done: true};

			try{
				this.prevValue = this.nextFunc(this.prevValue);
			}catch(e){
				if(e instanceof Generator.DoneException){
					this.ended = true;
					return {done: true};
				}else{
					throw e;
				}
			}
			return {done: false, value: this.prevValue};
		},
		static: {
			DoneException: Class.extends({}, Error)
		}
	});

	return Generator;
});