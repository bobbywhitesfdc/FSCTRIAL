({
	MAX_FILE_SIZE: 20000000,  /* max file upload capacity 25MB, however we limiting to 20MB for base64 formatting*/
	CHUNK_SIZE: 750000,       /* for larger file, the upload is done through chucks of this size (750K) */
	onInit: function(cmp, event, helper) {
		//get object metadata
		var action = cmp.get("c.getAllFields");
		action.setParams({
			fsName: cmp.get("v.fieldSetName")
		});
		action.setStorable();
		action.setCallback(this, function(response) {
			if (response.getState() === "SUCCESS") {
				var fields = response.getReturnValue();
				cmp.set("v.fields", fields);
			} else if (response.getState() === "ERROR") {
				//show error message
				cmp.set("v.errors", response.error);
			}
		});
		$A.enqueueAction(action);
	},
	onFileChange: function(cmp, event, helper) {
		var files = cmp.find("file").get("v.files");
		if(!$A.util.isEmpty(files) && files.length > 0) {
			var file = files[0];
			var icon = (file.type.indexOf("image/") == 0) ? "doctype:image" : "doctype:attachment";
			cmp.set("v.file", file);
			cmp.set("v.icon", icon);
		}
	},
	onFileRemove: function(cmp, event, helper) {
		cmp.set("v.file", {});
		cmp.find("file").set("v.value", null);
	},
	onSave: function(cmp, event, helper) {
		//clear errors
		var errorMessages = [];
		var fields = cmp.get("v.fields");
		var fieldMap = {};
		var fieldErrors = [];
		var file = cmp.get("v.file");
		//track the size of every chunk
		var self = this;

		fields.forEach(function(field) {
			fieldMap[field.fieldPath] = field.value;
			//check if required fields have been filled in
			if(field.required && $A.util.isEmpty(field.value)) {
				fieldErrors.push(field.label);
			}
		});

		//checks if fields are invalid
		if(!$A.util.isEmpty(fieldErrors)) {
			errorMessages.push(this.format($A.get("$Label.FinServ.Msg_Error_Required_Fields"), fieldErrors.join(", ")));
		}
		//check if file invalid (size)
		if (!$A.util.isEmpty(file) && file.size > this.MAX_FILE_SIZE) {
			errorMessages.push(this.format($A.get("$Label.FinServ.Msg_Error_File_Size"), this.MAX_FILE_SIZE , file.size ));
		}
		cmp.set("v.errors", errorMessages);


		// if no errors
		if ($A.util.isEmpty(errorMessages)) {
			// the spinner
			$A.get("e.force:toggleModalSpinner").setParams({
					"isVisible": true
				}).fire();
			// no errors we can continue
			if($A.util.isEmpty(file)) {
				//no file, just save the referral
				self.uploadAndOrSave(cmp, fieldMap, fields,'','');
			} else {
				// there is a file, save the referral and attach the file
				var reader = new FileReader();
				reader.onload = function() {
					var fileContents = reader.result;
					var base64Mark = 'base64,';
					var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
					fileContents = fileContents.substring(dataStart);
					// save file, no attachId yet
					self.uploadAndOrSave(cmp, fieldMap, fields, file, fileContents);
				};
				reader.readAsDataURL(file);
			}
		} else {
			//re-enable save button
			cmp.find("save").set("v.disabled", false);
		}
	},
	uploadAndOrSave: function(cmp, fieldMap, fields, file, fileContents) {
		var action = cmp.get("c.saveReferralWithAttachment");
		var fromPos = 0;
		var toPos   = this.CHUNK_SIZE; 
		var chunk = '';
		var self = this;
		var allUserAccess = cmp.get("v.allUserAccess");
		
		if(fileContents != '') {
			//first chunk of data
			chunk = fileContents.substring(0, this.CHUNK_SIZE);
		} 

		if($A.util.isEmpty(file)) {
			// no file save the referral only
			action.setParams({
				fields: fieldMap,
				bypassCRUDAndFLS: allUserAccess
			});
			$A.enqueueAction(action);
		} else {
			//we have file save referral and attachment
			action.setParams({
				fields: fieldMap,
				bypassCRUDAndFLS: allUserAccess,
				fileName: file.name,
				base64Data: encodeURIComponent(chunk), 
				contentType: file.type
			});
			$A.enqueueAction(action);
		}
			
		action.setCallback(this, function(response) {
			// use the callback to make recursive calls in case of bigger files  
			if (!$A.util.isEmpty(file) && (fileContents.length > self.CHUNK_SIZE) ) {
				//file not empty and we have attachment already
				var referralId, attachId;  // attachment ID, will be used to append remaining chunks
				var referralWAttach = response.getReturnValue();
				//retreive the recordId, and fileId for the attachment
				for ( var key in referralWAttach ) {
					if(key == 'referralId') {
						referralId = referralWAttach[key];
					} else if (key == 'fileId') {
						attachId = referralWAttach[key];
					}
				}
				fromPos = toPos;
				toPos = Math.min(fileContents.length, fromPos + self.CHUNK_SIZE); 
				self.appendToTheFile(cmp, fileContents, fromPos, toPos, attachId);  
			} else {
				// the chunk was enough for the while file
				self.onComplete(cmp, response);
			}
		});
	},
	appendToTheFile: function(cmp, fileContents, fromPos, toPos, attachId) {
		var action = cmp.get("c.appendToFile");
		var chunk = fileContents.substring(fromPos, toPos);
		var self = this;

		action.setParams({
				fileId: attachId,
				base64Data: encodeURIComponent(chunk)
			});
		$A.enqueueAction(action);
		
		action.setCallback(this, function(response) {
			fromPos = toPos;
			toPos = Math.min(fileContents.length, fromPos + self.CHUNK_SIZE); 
			if (fromPos < toPos) {
				//more data, keep on appending the remaining data
				self.appendToTheFile(cmp, fileContents, fromPos, toPos, attachId);  
			} else {
				//done with last chunk
				self.onComplete(cmp, response);
			}
		});

	},
	onComplete: function(cmp, response) {
		if (response.getState() === "SUCCESS") {
			//fire toast message
			$A.get("e.force:showToast").setParams({
				message: $A.get("$Label.FinServ.Msg_Success_Referral_Created"),
				key: "success",
				type: "success",
				isClosable: true
			}).fire();
			//reset fields to default values
			var fields = cmp.get("v.fields");
			fields.forEach(function(field) {
				field.value = field.defaultValue;
			});
			cmp.set("v.fields", []);
			cmp.set("v.fields", fields);
			cmp.set("v.file", {});
			cmp.find("file").set("v.value", null);
			
		} else if (response.getState() === "ERROR") {
			//show error message
			var errorMessages = [];
			response.getError().forEach(function(error) {
				errorMessages.push(error.message);
			});
			cmp.set("v.errors", errorMessages);
		}

		$A.get("e.force:toggleModalSpinner").setParams({
				"isVisible": false
			}).fire();
		cmp.find("save").set("v.disabled", false);
	},
	format: function(formatString,arg1,arg2,argN){
		//same function as $A.util.format()
		var formatArguments = Array.prototype.slice.call(arguments,1);
		return formatString.replace(/\{(\d+)\}/gm, function(match, index) {
			var substitution = formatArguments[index];
			if (substitution === undefined) {
				match = '';
				return match;
			}
			return substitution + '';
		});
	}
})