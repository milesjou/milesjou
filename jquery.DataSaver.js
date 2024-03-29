(function($, window, document, undefined){

	var pluginName = "DataSaver";
	var defaults = {
		timeout: 0, 
		events: "change"
	}
	
	function DataSaver(element, options) {
		this.element = element;
		this._defaults = defaults;
		this.options = $.extend({}, defaults, options);
		this.action = typeof options === "string" ? options : "default";
		
		this.getkey();
		this.init();
	}

	//Local Storage Key 顯示
	DataSaver.prototype.getkey = function() {
		var keyName = pluginName + "_key";
		var key = this.element[keyName];

		if (typeof key === "undefined") {
			var node = {
				
			}
			if ($(this.element).is(":input")) {
				//node.type = this.element.type;
				node.id = this.element.id;
			}
			if (!$(this.element).is(":radio")) {
				node.id = this.element.id;
			}

			key = [pluginName, JSON.stringify(node)];
			this.element[keyName] = key;
		}
		
		return key;
	};

	//Load data from localStorage
	DataSaver.prototype.load = function() {
		var key = this.getkey();
		var val = localStorage[key];

		if (val != null) {
			switch (this.element.tagName) {
				case "INPUT":
					var type = $(this.element).attr("type").toUpperCase();
					switch (type) {
						case "CHECKBOX":
							$(this.element).prop('checked', (val === "true"));
						break;

						case "RADIO":
							$("input[type=radio][name=" + this.element.name + "]" + "[value=" + val + "]").prop('checked', true);
						break;

						default:
							$(this.element).val(val);
						break;
					}
				break;

				case "SELECT":
					val = val.split(','); //for multiple select
					$(this.element).val(val);
				break;

				case "TEXTAREA":
					$(this.element).val(val);
				break;
			}
		}

		return $(this.element).trigger(pluginName + "_load");
	};

	//Save data in localStorage
	DataSaver.prototype.save = function() {
		var key = this.getkey();
		var val;

		switch (this.element.tagName) {
			case "INPUT":
				var type = $(this.element).attr("type").toUpperCase();
				switch (type) {
					case "CHECKBOX":
						val = $(this.element).prop('checked');
					break;

					case "RADIO":
						val = $(this.element).val(); //keys for all radio[name] should match
					break;

					default:
						val = $(this.element).val();
					break;
				}
			break;

			case "SELECT":
				val = $(this.element).val();
			break;

			case "TEXTAREA":
				val = $(this.element).val();
			break;
		}

		if (typeof val !== "undefined") {
			localStorage[key] = val;
		}

		return $(this.element).trigger(pluginName + "_save");
	};

	//Remove data in localStorage
	DataSaver.prototype.remove = function() {
		var key = this.getkey();
		localStorage.removeItem(key);

		return $(this.element).trigger(pluginName + "_remove");
	};

	//Start the DataSaver: load data and bind actions
	DataSaver.prototype.start = function() {
		var it = this;
		this.stop();
		this.load();
		
		if (typeof this.options.events !== "undefined" && this.options.events.length > 0) {
			this.options.events = this.options.events.split(',').join(' ');
			this.element[pluginName + "_events"] = this.options.events;
			//$(document.body).on(this.options.events, this.element, function() {
			$(this.element).on(this.options.events, function() {
				it.save();
			});
		}

		if (typeof this.options.timeout === "number" && this.options.timeout > 0) {
			this.element[pluginName + "_timeout"] = setInterval(function() {
				it.save();
			}, this.options.timeout);
		}

		return $(this.element).trigger(pluginName + "_start");
	};

	//Stop the DataSaver: unbind actions
	DataSaver.prototype.stop = function() {
		if (typeof this.element[pluginName + "_events"] !== "undefined") {
			$(document.body).off(this.element[pluginName + "_events"]);
		}
		if (typeof this.element[pluginName + "_timeout"] !== "undefined") {
			clearInterval(this.element[pluginName + "_timeout"]);
		}

		return $(this.element).trigger(pluginName + "_stop");
	};


	DataSaver.prototype.init = function() {
		switch (this.action) {
			case "load":
				return this.load();
			break;
			case "save":
				return this.save();
			break;
			case "remove":
				return this.remove();
			break;
			case "stop":
				return this.stop();
			break;
			default:
				return this.start();
			break;
		}
	};


	$.fn[pluginName] = function (options) {
		if (!('localStorage' in window && window['localStorage'] !== null)) {
			$.error("Your browser doesn't support localStorage.");
		}

		return this.each(function () {
			$.data(this, 'plugin_' + pluginName, new DataSaver(this, options));
		});
	}

})(jQuery, window, document);
