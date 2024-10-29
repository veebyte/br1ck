const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const progress = document.querySelector('.progress');
const progressFill = document.querySelector('.progress-fill');
const resetText = document.getElementById('reset-text');

function findTime(content) {
    const lines = content.split("\n");
    const text = resetText;
    
    const enrollmentStart = lines.find(line => line.includes('Show enrollment screen'));
    if (!enrollmentStart) {
        text.style.display = "block";
        text.innerText = "Error (THIS IS NOT A BUG!): Could not parse for 'Show enrollment screen', please ask for support in TitaniumNetwork or copernicium";
        text.style.color = "#ed8796";
        return;
    }

    const enrollmentStartIndex = enrollmentStart.indexOf('WARNING', 0);
    const startTime = enrollmentStart.substring(0, enrollmentStartIndex).trim();

    const endLine = lines.find(line => line.includes('Blocking dev mode by device policy'));
    if (!endLine) {
        text.style.display = "block";
        text.innerText = "Error (THIS IS NOT A BUG!): Could not parse for 'Blocking dev mode by device policy', please ask for support in TitaniumNetwork or copernicium";
        text.style.color = "#ed8796";
        return;
    }

    const timeIndex = endLine.indexOf('WARNING', 0);
    const endTime = endLine.substring(0, timeIndex).trim();

    const formattedStartTime = startTime.replace('t', 'T').replace('z', 'Z');
    const formattedEndTime = endTime.replace('t', 'T').replace('z', 'Z');

    const startDate = new Date(formattedStartTime);
    const endDate = new Date(formattedEndTime);
    
    const timeDifference = endDate - startDate;
    const displayTime = ((timeDifference - 200) / 1000) + " - " + ((timeDifference + 200) / 1000);

    text.innerText = "Reset Timing: " + displayTime;
    text.style.color = "#e0e0e0";
    text.style.display = "block";
    text.style.animation = "glow 1s 1";
    
    setTimeout(() => {
        text.style.animation = "";
    }, 1000);
}

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

async function handleFile(file) {
    if (!file || !file.name.endsWith('.tar.gz')) {
        resetText.style.display = "block";
        resetText.innerText = "Please select a valid .tar.gz file";
        resetText.style.color = "#ed8796";
        return;
    }

    progress.style.display = 'block';
    progressFill.style.width = '0%';

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const gunzipped = pako.ungzip(new Uint8Array(arrayBuffer));
        
        const files = await processTar(gunzipped);
        
        const chromeLogPattern = /var\/log\/chrome\/chrome_(\d+)-(\d+)/;
        let latestLog = null;
        let latestTimestamp = 0;

        for (const file of files) {
            const match = file.name.match(chromeLogPattern);
            if (match) {
                const timestamp = parseInt(match[1] + match[2]);
                if (timestamp > latestTimestamp) {
                    latestTimestamp = timestamp;
                    latestLog = file;
                }
            }
        }

        if (latestLog) {
            const decoder = new TextDecoder();
            const content = decoder.decode(latestLog.content);
            findTime(content);
        } else {
            resetText.style.display = "block";
            resetText.innerText = "No Chrome log files found in the archive.";
            resetText.style.color = "#ed8796";
        }

    } catch (error) {
        resetText.style.display = "block";
        resetText.innerText = `Error processing file: ${error.message}`;
        resetText.style.color = "#ed8796";
    }

    progress.style.display = 'none';
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                progressFill.style.width = percent + '%';
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

function processTar(buffer) {
    const files = [];
    let offset = 0;

    while (offset < buffer.length - 512) {
        const header = buffer.slice(offset, offset + 512);
        const fileName = new TextDecoder().decode(header.slice(0, 100)).trim();
        
        if (fileName.length === 0) {
            break;
        }

        const sizeString = new TextDecoder().decode(header.slice(124, 136)).trim();
        const fileSize = parseInt(sizeString, 8);

        const content = buffer.slice(offset + 512, offset + 512 + fileSize);
        
        files.push({
            name: fileName,
            size: fileSize,
            content: content
        });

        offset += 512 + (Math.ceil(fileSize / 512) * 512);
    }

    return files;
}