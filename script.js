document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQjPYjZZCgGr_bxtkeDhPLZp6V6sWRTL0JrWoq0BOKLBvXO1H1z7QtJMVVjOwiPcAcSFmsqol0sezWH/pub?gid=0&single=true&output=csv')
        .then(response => response.text())
        .then(data => processCSV(data));
});

function processCSV(data) {
    const rows = data.split('\n').slice(1);
    const records = {};

    rows.forEach(row => {
        const [classType, playlist, race, driver, time, car] = row.split(',');
        if (!records[classType]) {
            records[classType] = {};
        }
        const playlistKey = playlist || race;
        if (!records[classType][playlistKey]) {
            records[classType][playlistKey] = {};
        }
        if (!records[classType][playlistKey][race] || records[classType][playlistKey][race].time > time) {
            records[classType][playlistKey][race] = { driver, time, car };
        }
    });

    displayRecords(records);
}

function displayRecords(records) {
    const container = document.getElementById('records');
    const formattedTextContainer = document.getElementById('formattedText');
    const copyButton = document.getElementById('copyButton');
    container.insertBefore(copyButton, container.firstChild); // Move copy button to the top
    const classOrder = ['B', 'A', 'A+', 'S', 'S+'];
    let formattedText = '# UNBOUND RECORDS\n';

    classOrder.forEach(classType => {
        if (records[classType]) {
            const classHeader = document.createElement('h2');
            classHeader.textContent = classType;
            container.appendChild(classHeader);
            // Remove class separator from copied text
            // formattedText += `## ${classType}\n`;

            for (const playlist in records[classType]) {
                const playlistHeader = document.createElement('h3');
                playlistHeader.textContent = playlist;
                container.appendChild(playlistHeader);
                formattedText += `## *${classType}* - ${playlist}\n`;

                let playlistText = '';
                for (const race in records[classType][playlist]) {
                    if (playlist !== race) {
                        const raceHeader = document.createElement('h4');
                        raceHeader.textContent = race;
                        container.appendChild(raceHeader);
                        playlistText += `### ***${race}***\n`;
                    }

                    const record = records[classType][playlist][race];
                    const recordText = `${record.driver} - ${record.time}`;
                    const recordElement = document.createElement('p');
                    recordElement.textContent = recordText;
                    container.appendChild(recordElement);
                    playlistText += `:${record.driver}: __${record.driver}__ - ${record.time}\n`;

                    const carElement = document.createElement('p');
                    carElement.textContent = record.car;
                    carElement.style.marginLeft = '40px';
                    container.appendChild(carElement);
                    playlistText += `_${record.car}_\n`;
                }
                formattedText += playlistText.trim() + '\n';
            }
        }
    });

    formattedTextContainer.textContent = formattedText.trim();
}

function copyToClipboard() {
    const formattedTextContainer = document.getElementById('formattedText');
    formattedTextContainer.style.display = 'block';
    const range = document.createRange();
    range.selectNode(formattedTextContainer);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    formattedTextContainer.style.display = 'none';
}
