function Api(url) {
	this.url        = url;
  this.apiVersion = "1";

	for (var methodName in this.performer) {
		this.performer[methodName] = this.performer[methodName].bind(this);
	}
}

Api.prototype = {
	client: function() {
		var xhr = new XMLHttpRequest();

		return xhr;
	},

  /**
   * Serialize the given object to an query string.
   *
   * @param   {{}} obj
   * @returns {string}
   */
  serialize: function(obj, prefix) {
    var str = [];
    for(var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ?
          this.serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  },

	request: function(method, url, params, callback) {
		if (typeof params === 'function') {
			callback = params;
			params   = {};
		}

		if (method !== "GET" && method !== "POST") {
			throw new Error("Invalid method " + method);
		}

		if (typeof params !== "object") {
			throw new Error("Params is not an object");
		}

		if (typeof callback !== "function") {
			throw new Error("Callback is not an function");
		}

		var c        = this.client(),
        paramStr = this.serialize(params);

    c.open(method, this.url + '/' + url, true);

    if (method === "POST") {
      c.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    c.onreadystatechange = function() {
			var response = null,
				error    = null;

			if (c.readyState !== 4) return;

			try {
				response = JSON.parse(c.responseText);
			} catch (exception) {
				response = null;
				error    = {
					error	   : exception
				};
			}

			if (error != null) {
				error.status     = c.status;
				error.readyState = c.readyState;
			}

			callback(error, response);
		};

		c.send(paramStr);
	},

	/**
	 * Convert a Form object to an nested object
	 * @param {HtmlElement} formElement
	 * @returns {{}}
	 */
	formValues: function(formElement) {
		var fieldsets = formElement.childNodes,
			  vars 	    = {};

		for (var i in fieldsets) {
			var fieldset 	 = fieldsets[i],
				fieldsetVars = {},
				inputs 		 = fieldset.childNodes;

			if (fieldset.tagName !== 'FIELDSET') {
				continue;
			}

			for (var i in inputs) {
				var input = inputs[i];

				if (input.tagName !== 'INPUT') {
					continue;
				}

				fieldsetVars[input.name] = input.value;
			}

			vars[fieldset.name] = fieldsetVars;
		}

		return vars;
	},

	/**
	 * Do a post call
	 *
	 * @param {string} url
	 * @param {{}} 	   parameters
	 * @param {Function(error, result)} callback
	 *
	 * @returns Api
	 */
	post: function(url, params, callback) {
		this.request("POST", url, params, callback);

		return this;
	},

	/**
	 * Do a get call
	 *
	 * @param {string} url
	 * @param {{}} 	   parameters
	 * @param {Function(error, result)} callback
	 *
	 * @returns Api
	 */
	get: function(url, params, callback) {
		this.request("GET", url, params, callback);

		return this;
	},

	/**
	 * @param {HtmlElement} formElement
	 * @param {{}} 			object Nested object with { fieldsetName: { inputName: { placeholder: "", value: "", type: "text" } }  }
	 */
	convertObjectToForm: function(formElement, object) {
		for (var fieldsetName in object) {
			var fieldset  		= object[fieldsetName],
				fieldsetElement = document.createElement('fieldset');

			fieldsetElement.name = fieldsetName;

			for (var inputName in fieldset) {
				var input = typeof fieldset[inputName] === 'object' ? fieldset[inputName] : { name : inputName, placeholder: fieldset[inputName] },
					  id    = fieldsetName + '_' + inputName;

				var labelElement = document.createElement('label'),
					  inputElement = document.createElement('input');

				labelElement.setAttribute('for', id);
				labelElement.textContent = input.label || input.name;

				inputElement.id   	 	 = id;
				inputElement.name 		 = input.name;
				inputElement.placeholder = input.placeholder || input.name;
				inputElement.type 		 = input.type || 'text';
				inputElement.value       = input.value || 'wawah';
				inputElement.setAttribute('required', input.required || 0);

				fieldsetElement.appendChild(labelElement);
				fieldsetElement.appendChild(inputElement);
			}

			formElement.appendChild(fieldsetElement);
		};
	},

	performer: {
		checkUsername: function(username, callback) {
			return this.get("performer/check-username/" + username, {}, callback);
		},
		register : function(form, callback) {
			return this.post("performer", form, callback);
		}
	}
};
