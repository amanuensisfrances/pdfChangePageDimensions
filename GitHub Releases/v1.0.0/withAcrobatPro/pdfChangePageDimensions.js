const fs = require("fs");
const { exec } = require("child_process");
const { execSync } = require("child_process");

// Command-line arguments (node resizeTopAligned.js <inputPDF> <desiredWidth>x<desiredHeight>)
const inputPDF = process.argv.slice(2)[0];
const desiredDimensions = process.argv.slice(3)[0];
const desiredWidth = desiredDimensions.split("x")[0];
const desiredHeight = desiredDimensions.split("x")[1];

const userprofile = "%homedrive%%homepath%"; // 'C:\Users\<username>' directory
const waitingTimeForAcrobat = 5; // Amount of time (in seconds) spent waiting for Acrobat to open 
const waitingTimeForPrinter = 7; // Amount of time (in seconds) spent waiting for Bullzip PDF printer to virtually print

// Steps 1 and 2
try {
    execSync(`copy ${inputPDF} step1.pdf`);
    execSync("copy step1.pdf step2.pdf");
    execSync(`copy ${userprofile}\\Downloads\\printStep2.bat printStep2.bat`);
    exec("printStep2.bat"); // Virtually print 'step2.pdf' and save it in the 'Downloads' folder
    execSync(`ping 1.1.1.1 -n ${waitingTimeForAcrobat} > nul && taskkill /f /im Acrobat.exe && ping 1.1.1.1 -n ${waitingTimeForPrinter} > nul`); // Wait 5 seconds then exit Adobe Acrobat Pro and then wait 5 more seconds
    execSync(`copy ${userprofile}\\Downloads\\step2.pdf step2.pdf`); // Overwrite 'step2.pdf' in current directory
    console.log("\nSteps 1 and 2 are done!\n");
}	catch(error) {
    console.error(error);
}

function removeWhitespaces(string) {return string.replace(/\s/g, "");}
function roundNumber(number, scale = 2) {// 'Solution 1' from https://stackoverflow.com/a/12830454/
    if (!("" + number).includes("e")) {
        return +(Math.round(number + "e+" + scale) + "e-" + scale);
    }	else {
            let arr = ("" + number).split("e");
            let sig = "";
            if (+arr[1] + scale > 0) {sig = "+";}
            return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
        }
}

// Step 3
const regex = new RegExp(/(?<=Page size:)(.*?)(?=pts)/, "g"); // Regex to search between "Page size:" and "pts" then return the page dimensions in the form "<width> x <height>"
const step1Metadata = String(execSync("pdfinfo step1.pdf"));
const step1Dimensions = removeWhitespaces(step1Metadata.match(regex)[0]);
const step1Width = step1Dimensions.split("x")[0];
const step1Height = step1Dimensions.split("x")[1];
const step2Metadata = String(execSync("pdfinfo step2.pdf"));
const step2Dimensions = removeWhitespaces(step2Metadata.match(regex)[0]);
const step2Width = step2Dimensions.split("x")[0];
const step2Height = step2Dimensions.split("x")[1];
const step3Width = desiredWidth
const step3Height = (desiredWidth / step2Width) * step2Height;
const step3Dimensions = `${step3Width}x${roundNumber(step3Height)}`;
const step4Dimensions = desiredDimensions;
const step4Width = desiredWidth;
const step4Height = desiredHeight;

const step3Command = `gs
-o step3.pdf
-sDEVICE=pdfwrite
-dDEVICEWIDTHPOINTS=${step3Width}
-dDEVICEHEIGHTPOINTS=${step3Height}
-dFIXEDMEDIA
-dPDFFitPage
-c "[ /PageMode /UseOutlines /Page 1 /View [/Fit] /PageLayout /SinglePage /DOCVIEW pdfmark"
-f step2.pdf`;

try {
    execSync(step3Command.replace(/\n/g, " ^"));
    console.log("Step 3 is done!\n");
}	catch(error) {
    console.error(error);
}

// Step 4
const xCoordinate1 = 0;
const xCoordinate2 = xCoordinate1 + step4Width;
const yCoordinate2 = (step3Height - (step3Height - ((step4Width / step1Width) * step1Height)) / 2);
const yCoordinate1 = yCoordinate2 - step4Height;

const step4Command = `gs
-o step4.pdf
-sDEVICE=pdfwrite
-c "[/CropBox [${xCoordinate1} ${yCoordinate1} ${xCoordinate2} ${yCoordinate2}] /PAGES pdfmark"
-c "[/PageMode /UseOutlines /Page 1 /View [/Fit] /PageLayout /SinglePage /DOCVIEW pdfmark"
-f step3.pdf`;

try {
    execSync(step4Command.replace(/\n/g, " ^"));
    execSync(`copy ${userprofile}\\Downloads\\empty-pdf-metadata empty-pdf-metadata`);
    execSync("pdftk step4.pdf update_info empty-pdf-metadata output output.pdf");
    execSync("exiftool -all:all= -overwrite_original output.pdf");
    execSync("del empty-pdf-metadata");
    execSync("del step1.pdf");
    execSync("del step2.pdf");
    execSync(`del ${userprofile}\\Downloads\\step2.pdf`);
    execSync("del step3.pdf");
    execSync("del step4.pdf");
    console.log("\nStep 4 is done!\n");
}	catch(error) {
    console.error(error);
}

console.log(`Dimensions of step1.pdf: ${step1Dimensions}`);
console.log(`Width of step1.pdf: ${step1Width}`);
console.log(`Height of step1.pdf: ${step1Height}`);
console.log(`\nDimensions of step2.pdf: ${step2Dimensions}`);
console.log(`Width of step2.pdf: ${step2Width}`);
console.log(`Height of step2.pdf: ${step2Height}`);
console.log(`\nDimensions of step3.pdf: ${step3Dimensions}`);
console.log(`Width of step3.pdf: ${step3Width}`);
console.log(`Height of step3.pdf: ${roundNumber(step3Height)}`);
console.log(`\nDimensions of step4.pdf: ${step4Dimensions}`);
console.log(`Width of step4.pdf: ${step4Width}`);
console.log(`Height of step4.pdf: ${step4Height}`);
console.log(`\nPDF metadata of output.pdf:\n${String(execSync("pdfinfo output.pdf")).trim()}`);