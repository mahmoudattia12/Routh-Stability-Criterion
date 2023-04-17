var orderInput = document.getElementById("order");
var defaultOrder = parseInt(orderInput.value);
if (defaultOrder >= 0) {
	createCoefficientsInputs(defaultOrder);
}

const orderError = document.getElementById('order-error');
const coeffError = document.getElementById('coeff-error');
orderInput.addEventListener("input", function () {
	var order = parseInt(this.value);
	if (orderInput.value.trim() === '') {
		orderError.style.display = 'inline';
	} else {
		orderError.style.display = 'none';
		if (order >= 0) {
			createCoefficientsInputs(order);
		}
	}
});

function createCoefficientsInputs(order) {
	var coefficientsDiv = document.getElementById("coefficientsDiv");
	coefficientsDiv.innerHTML = "";
	var h3 = document.createElement("h3");
	h3.innerHTML = "System Characteristic Equation: ";
	h3.style = "padding: 5px"
	coefficientsDiv.appendChild(h3);
	for (var i = 0; i <= order; i++) {
		var input = document.createElement("input");
		input.type = "number";
		input.id = "s^" + i;
		input.name = "s^" + i;
		input.value = i + 1;
		input.required = true;
		coefficientsDiv.appendChild(input);
		if (i == order) {
			var label = document.createElement("label");
			label.for = "s^" + i;
			label.innerHTML = "s^" + (order - i) + " =  0";
			coefficientsDiv.appendChild(label);
		} else {
			var label = document.createElement("label");
			label.for = "s^" + i;
			label.innerHTML = "s^" + (order - i) + " + ";
			coefficientsDiv.appendChild(label);
		}
	}
}

function getCoefficients() {
	var order = document.getElementById("order").value;
	var outDiv = document.getElementById("outputDiv");
	var ResDiv = document.getElementById("stabilityDiv");
	var sep1 = document.getElementById("separator1");
	var sep2 = document.getElementById("separator2");
	if (orderInput.value.trim() === '') {
		orderError.style.display = 'inline';
		display(outDiv, ResDiv, sep1, sep2, 'hidden')
	} else {
		display(outDiv, ResDiv, sep1, sep2, 'visible')
		orderError.style.display = 'none';
		var coefficients = [];
		var calc = true;
		for (var i = 0; i <= order && calc; i++) {
			coeffVal = parseFloat(document.getElementById("s^" + i).value);
			if (isNaN(coeffVal)) {
				calc = false;
			} else {
				coefficients.push(parseFloat(document.getElementById("s^" + i).value));
			}
		}
		if (calc) {
			coeffError.style.display = 'none';
			display(outDiv, ResDiv, sep1, sep2, 'visible')
			calculateRouthArray(coefficients, order);
		} else {
			coeffError.style.display = 'inline';
			display(outDiv, ResDiv, sep1, sep2, 'hidden')
		}
	}
}

function display(div1, div2, div3, div4, visibility) {
	div1.style.visibility = visibility;
	div2.style.visibility = visibility;
	if (div3 !== null && div4 !== null) {
		div3.style.visibility = visibility;
		div4.style.visibility = visibility;
	}
}

var clear1 = false, clear2 = false;

function calculateRouthArray(coefficients, order) {
	var routhArray = [];
	//to get system stability
	var signChanges = 0, currSign;
	// first 2 rows from the coeff
	routhArray[0] = coefficients.filter(function (value, index) {
		return index % 2 == 0;
	});
	if (routhArray[0][0] >= 0) currSign = 'P';
	else currSign = 'N';

	routhArray[1] = coefficients.filter(function (value, index) {
		return index % 2 != 0;
	});
	if (order % 2 == 0) {
		routhArray[1].push(0);
	}
	if (routhArray[1][0] >= 0) {
		if (currSign == 'N') {
			signChanges++;
			currSign = 'P';
		}
	} else {
		if (currSign == 'P') {
			signChanges++;
			currSign = 'N';
		}
	}
	var cols = routhArray[0].length;
	var end = false;
	// the remaining rows
	for (var i = 2; i <= order; i++) {
		var pivot = routhArray[i - 1][0];
		if (pivot != 0) {
			if (pivot >= 0) {
				if (currSign == 'N') {
					signChanges++;
					currSign = 'P';
				}
			} else {
				if (currSign == 'P') {
					signChanges++;
					currSign = 'N';
				}
			}
			var l1 = routhArray[i - 2];
			var l2 = routhArray[i - 1];
			routhArray[i] = [];
			for (var j = 0; j < cols - 1; j++) {
				var res = ((pivot * l1[j + 1]) - (l1[0] * l2[j + 1])) / pivot;
				routhArray[i].push(res);
			}
			routhArray[i].push(0);
		} else {
			var case1 = false;
			for (var j = 1; j < cols; j++) {
				if (routhArray[i - 1][j] != 0) {
					case1 = true;
					break;
				}
			}
			if (case1) {
				//handle case1 (pivot is zero)
				coefficients.reverse();
				//recursion
				try {
					calculateRouthArray(coefficients);
				} catch (err) {
					console.log("can't solve");
				}
				end = true;
				break;
			} else {
				//handle case2 (entire row is zeros)
				var currOrder = order - (i - 2);
				for (var j = currOrder, x = 0; j >= 0 && x < cols; j = j - 2, x++) {
					routhArray[i - 1][x] = j * routhArray[i - 2][x]
				}
				//to recalculate pivot and i-th routh row
				i--;
			}
		}
	}
	if (!end) {
		if (routhArray[order][0] >= 0) {
			if (currSign == 'N') {
				signChanges++;
				currSign = 'P';
			}
		} else {
			if (currSign == 'P') {
				signChanges++;
				currSign = 'N';
			}
		}
		//view the routh table
		const outputDiv = document.getElementById("outputDiv");
		const inputDiv = document.getElementById("inputDiv");

		outputDiv.innerHTML = "";
		const separator = document.createElement('hr');
		separator.id = "separator1";
		separator.style.borderTop = "2px solid white";
		separator.style.marginTop = "20px";
		separator.style.marginBottom = "20px";
		separator.style.marginLeft = "150px";
		separator.style.marginRight = "150px";

		if (!clear1) {
			const parentElement = inputDiv.parentElement;
			parentElement.insertBefore(separator, outputDiv);
			clear1 = true;
		}
		var div = document.createElement("div");
		var h2 = document.createElement("h2");
		h2.innerHTML = "Routh Matrix: ";
		h2.style.fontSize = "25px"
		div.appendChild(h2);
		const table = document.createElement("table");
		table.classList.add("routh-table");
		for (let i = 0; i <= order; i++) {
			const row = document.createElement("tr");
			for (let j = 0; j < routhArray[i].length; j++) {
				const cell = document.createElement("td");
				const value = routhArray[i][j].toFixed(4);
				cell.textContent = value;
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		div.appendChild(table);
		outputDiv.appendChild(div);
		//view system stabilty
		var div = document.createElement("div");
		const stabilityDiv = document.getElementById("stabilityDiv");
		stabilityDiv.style.background = "white"
		stabilityDiv.style.marginBottom = "100px"
		stabilityDiv.style.borderRadius = "15px"
		const separator2 = document.createElement('hr');
		separator2.id = "separator2";
		separator2.style.borderTop = "2px solid white";
		separator2.style.marginTop = "20px";
		separator2.style.marginBottom = "20px";
		separator2.style.marginLeft = "150px";
		separator2.style.marginRight = "150px";
		if (!clear2) {
			const parentElement2 = outputDiv.parentElement;
			parentElement2.insertBefore(separator2, stabilityDiv);
			clear2 = true;
		}
		stabilityDiv.innerHTML = "";
		var h2 = document.createElement("h2");
		h2.innerHTML = "Result :-";
		h2.style.marginTop = "1px"
		h2.style.fontSize = "25px";
		div.appendChild(h2);
		stabilityDiv.appendChild(div);
		var stabilityH = document.createElement("h2");
		stabilityH.style.fontSize = "20px";
		if (signChanges == 0) {
			//system stable
			stabilityH.innerHTML = "System is Stable";
			div.appendChild(stabilityH);
			stabilityDiv.appendChild(div);
		} else {
			//system unstable
			stabilityH.innerHTML = "System is Unstable";
			div.appendChild(stabilityH);
			var poles = document.createElement("h2");
			poles.innerHTML = "Number of poles in the RHS of the s plane:  " + signChanges;
			poles.style.fontSize = "20px";
			div.appendChild(poles);
			stabilityDiv.appendChild(div);
		}
	}
}
