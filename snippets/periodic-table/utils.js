function createModal(options){
	options = $.extend({
		title: "",
		content: "",
		backdrop: true,
		buttons: [],
		closeBtn: true,
		closeBtnText: "Close",
		closeBtnPrimary: true,
		onClose: function(){},
		onShown: function(){}
	}, options);

	var modal = $("<div>").attr({
			"class": "modal fade",
			"role": "dialog"
		}).attr("data-backdrop", options.backdrop),
		dialog = $("<div>").attr({
			"class": "modal-dialog"
		}).appendTo(modal),
		content = $("<div>").attr({
			"class": "modal-content"
		}).appendTo(dialog),
		header = $("<div>").attr({
			"class": "modal-header"
		}).appendTo(content),
		h4 = $("<h4>").attr({
			"class": "modal-title"
		}).html(options.title).appendTo(header),
		body = $("<div>").attr({
			"class": "modal-body"
		}).appendTo(content),
		footer = $("<div>").attr({
			"class": "modal-footer"
		}).appendTo(content);

		if(typeof(options.content) === "string"){
			body.html(options.content);
		}else{
			body.append(options.content);
		}

		if(options.closeBtn){
			$("<button>")
				.addClass("btn btn-" + (options.closeBtnPrimary ? "primary" : "default"))
				.attr("data-dismiss", "modal")
				.html(options.closeBtnText)
				.appendTo(footer);
		}
		$.each(options.buttons, function(){
			var entry = this;
			$("<button>")
				.addClass("btn btn-" + (this.primary ? "primary" : "default"))
				.html(this.title)
				.appendTo(footer)
				.click(function(){
					entry.onclick.call(modal);
				});
		});

	modal.appendTo("body").modal().on("hidden.bs.modal", function(){
		modal.remove();
		options.onClose();
	}).on("shown.bs.modal", options.onShown);

	return modal;
}

function gly(icon){
	return $("<span>").addClass("glyphicon glyphicon-" + icon + " ");
}

function addZeros(num, n){
	var parts = (""+num).split(".");
	if(parts[1] === undefined){
		return "" + parts[0] + "." + Array(n+1).join("0");
	}
	var len = ("" + parts[1]).length;
	if(len >= n){
		return num;
	}
	return "" + parts[0] + "." + parts[1] + Array(n - len + 1).join("0");
}