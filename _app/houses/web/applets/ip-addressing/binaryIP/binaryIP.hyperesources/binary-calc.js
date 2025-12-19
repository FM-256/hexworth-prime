function getCurrentSceneElement() {
	var hypeDocument = Object.values(HYPE.documents)[0];
	return document.getElementById(hypeDocument.currentSceneId());
}

function elementForField(field) {
	var bitElements = getCurrentSceneElement().getElementsByClassName("bit");
	for(var i = 0; i < bitElements.length; i++) {
		var bitNumber = parseInt(bitElements[i].getAttribute("data-bit"));
		if(bitNumber == field) {
			return bitElements[i];
		}		
	}
	return null;
}

function setBit(field, value) {
	var element = elementForField(field);
	if(value == 0) {
		element.innerText = "0";
		element.style.backgroundColor = "#000";
		element.style.color = "#fff";
	} else {
		element.innerText = "1";
		element.style.backgroundColor = "#fff";
		element.style.color = "#000";
	}
}

function getBit(field) {
	var element = elementForField(field);
	return parseInt(element.innerText);
}

function flipBit(field) {
	var bitValue = getBit(field);
	if(bitValue == 0) {
		setBit(field, 1);
	} else {
		setBit(field, 0);
	}
}

function currentValue() {
	var result = 0;
	var bitElements = getCurrentSceneElement().getElementsByClassName("bit");
	for(var i = 0; i < bitElements.length; i++) {
		var bitNumber = parseInt(bitElements[i].getAttribute("data-bit"));
		var bitValue = parseInt(bitElements[i].innerText);
		
		result += bitValue * Math.pow(2, bitNumber);
	}
	return result;
}

function updateResultValue() {
	getCurrentSceneElement().getElementsByClassName("resultValue")[0].innerText = "" + currentValue();

}


