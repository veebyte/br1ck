// this code is probably so shit im so sorry

function findTime(file) {
    const reader = new FileReader();
    text = document.getElementById("reset-text")

    reader.onload = function(event) {
        const fileContent = event.target.result;
        const lines = fileContent.split("\n");

        const enrollmentStart = lines.find(line => line.includes('Show enrollment screen'));
        try {
            enrollmentStartIndex = enrollmentStart.indexOf('WARNING', 0);
        } catch {
            text.style.display = "block"
            text.innerText = "Error (THIS IS NOT A BUG!): Could not parse for 'Show enrollment screen', please ask for support in TitaniumNetwork or copernicium"
            text.style.color = "red"
        }
        const startTime = enrollmentStart.substring(0, enrollmentStartIndex).trim();

        const endLine = lines.find(line => line.includes('Blocking dev mode by device policy'));
        
        try {
            timeIndex = endLine.indexOf('WARNING', 0);
        } catch {
            text.style.display = "block"
            text.innerText = "Error (THIS IS NOT A BUG!): Could not parse for 'Blocking dev mode by device policy', please ask for support in TitaniumNetwork or copernicium"
        }
        const endTime = endLine.substring(0, timeIndex).trim();


        const formattedStartTime = startTime.replace('t', 'T').replace('z', 'Z');
        const formattedEndTime = endTime.replace('t', 'T').replace('z', 'Z');

        const startDate = new Date(formattedStartTime);
        const endDate = new Date(formattedEndTime);

        const displayTime = ((endDate - startDate) - 200) / 1000 + " - " + ((endDate - startDate)+ 200) / 1000;

        text.innerText = "Reset Timing: " + displayTime
        text.style.color = "#e0e0e0"
        text.style.display = "block"
        text.style.animation = "glow 1s 1"
        
        setTimeout(() => {text.style.animation = "";}, 1000);
    };

    reader.readAsText(file);
}
