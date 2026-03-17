let currentText = '';

document.getElementById('txtFile').addEventListener('change',(e) =>{
	const file=e.target.files[0];
	if (!file) return;

	const reader= new FileReader();

	reader.onload=(event) =>{
		const text= event.target.result;
		analyzeText(text);
	}

	reader.readAsText(file);
});

document.getElementById('startButton').addEventListener('click', (e)=>{
	const text = document.getElementById('txtTextarea').value;
	analyzeText(text);
});


function analyzeText(text) {
  	currentText = text.toUpperCase();
  	const freq=computeFrequencies(text);
  	const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  	displayFrequencies(sorted);
  	buildMappingTable(sorted);
  	const singles = findSingleLetterWords(currentText);
	const doubled = findDoubledLetters(currentText);
	const freqWords = findFrequentWords(currentText);
	const apostrophe = findApostrophe(currentText);
	displayHints(singles, doubled, freqWords, apostrophe);
	updateOutput();
  
}

function computeFrequencies(text) {
	const freq={};

	for(const char of text){
		if (char >= 'A' && char <= 'Z'){
			freq[char] = (freq[char] || 0) + 1;
		}
	}
	return freq;

}

function displayFrequencies(sorted) {
	const section = document.getElementById('frequency-section');
	section.innerHTML = ''; 

	const max = sorted[0][1];

	for (const [letter, count] of sorted) {
	    const percent = (count / max) * 100;

	    const div=document.createElement("div");
	    div.classList.add("freq-row");
	    const spanLettre=document.createElement("span");
	    spanLettre.classList.add("freq-letter");
	    spanLettre.textContent=letter;
	    const divBar=document.createElement("div");
	    divBar.classList.add("freq-bar");
	    divBar.style.width = percent + '%';
	    const spanNb=document.createElement("span");
	    spanNb.classList.add("freq-count");
	    spanNb.textContent=count;
	    div.appendChild(spanLettre);
	    div.appendChild(divBar);
	    div.appendChild(spanNb);
	    section.appendChild(div);
	}
}


function buildMappingTable(sorted){
	const section=document.getElementById('mapping-section');
	section.innerHTML = '';

	for(const [letter, count] of sorted){
		const div=document.createElement("div");
		div.classList.add("mapping-row");
		const spanLettre=document.createElement("span");
		spanLettre.classList.add("cipher-letter");
		spanLettre.textContent=letter;
		const spanRow=document.createElement("span");
		spanRow.textContent="→";
		const input=document.createElement("input");
		input.classList.add("plain-input");
		input.setAttribute('data-cipher', letter);
		input.setAttribute('maxlength', '1');
		input.setAttribute('placeholder', '?');
		input.addEventListener('input', () => {
		  input.value = input.value;
		  updateOutput();
		});

		div.appendChild(spanLettre);
		div.appendChild(spanRow);
		div.appendChild(input);
		section.appendChild(div);

	}
}

function updateOutput() {
    const mapping=getMapping();
    let result = '';
  
    for (const char of currentText) {
	    if (mapping[char]) {
	      result += mapping[char];
	    }else {
	      result += char; 
	    }
    }
  

    const section=document.getElementById('output-section');
    section.innerHTML='';

    const div=document.createElement("div");
    const print=document.createElement("p");
    print.textContent=result;
    div.appendChild(print);
    section.appendChild(div);
}

function getMapping() {
    const mapping = {};
  	document.querySelectorAll('.plain-input').forEach(input => {
	    const cipher = input.getAttribute('data-cipher');
	    const plain = input.value;
	    if (plain) mapping[cipher] = plain;
	});
    return mapping;
}

function findSingleLetterWords(text) {
	const words = text.split(/[\s.,;:!?]+/);
	const singles = [...new Set(words.filter(w => w.length === 1 && w >= 'A' && w <= 'Z'))];
	return singles;
}

function findDoubledLetters(text) {
    const doubled = new Set();
    for (let i = 0; i < text.length - 1; i++) {
    	if (text[i] === text[i+1] && text[i] >= 'A' && text[i] <= 'Z') {
     		doubled.add(text[i]);
    	}
  	}
    return [...doubled];
}

function findFrequentWords(text) {
    const words = text.split(/[\s.,;:!?]+/).filter(w => w.length > 0);
    const freq = {};
    for (const word of words) freq[word] = (freq[word] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function findApostrophe(text) {
	const apostrophe = new Set();
	for(let i=0; i<text.length-1;i++){
		if(text[i+1]=="'" && text[i]>='A' && text[i]<='Z'){
			apostrophe.add(text[i]);
		}
	}
	return [...apostrophe];
}

function displayHints(singles, doubled, freqWords, apostrophe){
	const section=document.getElementById('hint-section');
	section.innerHTML='';

	const div=document.createElement("div");
    const single=document.createElement("p");
    if (singles.length === 0) {
	    single.textContent = "Aucun mot d'une lettre trouvé.";
	} else {
	    single.textContent = "Mots d'une lettre : " + singles.join(', ') + " → forcément A ou Y en français";
	}
	const double=document.createElement("p");
	if(doubled.length ===0){
		double.textContent="Aucune suite de deux lettre trouvé.";
	}else{
		double.textContent= "Suite de deux lettre : " + doubled.join(', ') + " → peut-être SS, TT, MM, RR, PP, LL, FF, CC, DD";
	}
	const freq=document.createElement("p");
	if(freqWords.length ===0){
		freq.textContent="Aucune suite de deux lettre trouvé.";
	}else{
		freq.textContent = "Mots fréquents : " + freqWords.map(([w, c]) => `${w}(${c})`).join(', ');
	}
	const apost=document.createElement("p");
	if(apostrophe.length ===0){
		apost.textContent="Aucun apostrophe trouvé";
	}else{
		apost.textContent = "Lettre devant un apostrophe " + apostrophe.join(', ') + " → peut-être D,S,J,T,L,N,M,C";
	}
    div.appendChild(single);
    div.appendChild(double);
    div.appendChild(freq);
    div.appendChild(apost);
    section.appendChild(div);
}