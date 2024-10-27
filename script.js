// this code is probably so shit im so sorry

function findTime(file) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        const lines = fileContent.split("\n");

        const enrollmentStart = lines.find(line => line.includes('Show enrollment screen'));
        const enrollmentStartIndex = enrollmentStart.indexOf('WARNING', 0);
        const startTime = enrollmentStart.substring(0, enrollmentStartIndex).trim();

        const step12 = lines.find(line => line.includes('Blocking dev mode by device policy'));
        const timeIndex = step12.indexOf('WARNING', 0);
        const endTime = step12.substring(0, timeIndex).trim();


        const formattedStartTime = startTime.replace('t', 'T').replace('z', 'Z');
        const formattedEndTime = endTime.replace('t', 'T').replace('z', 'Z');

        const startDate = new Date(formattedStartTime);
        const endDate = new Date(formattedEndTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error("Invalid date format");
            return;
        }

        const timeDifference = (endDate - startDate) / 1000;

        text = document.getElementById("reset-text")
        text.innerText = "Reset Timing: " + timeDifference
        text.style.display = "block"
        text.style.animation = "glow 1.5s 1"
        
        setTimeout(() => {text.style.animation = "";}, 1500);
    };

    reader.readAsText(file);
}
