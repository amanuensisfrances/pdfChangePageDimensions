const { exec } = require("child_process");
const { execSync } = require("child_process");

// Syntax: node pdfChangePageDimensions.js <inputPDF> <desiredWidth>x<desiredHeight>)
const inputPDF = process.argv.slice(2)[0];
const desiredDimensions = process.argv.slice(3)[0];
const desiredWidth = Number(desiredDimensions.split("x")[0]);
const desiredHeight = Number(desiredDimensions.split("x")[1]);
const userprofile = "%homedrive%%homepath%"; // 'C:\Users\<username>' directory
const waitingTimeForAcrobat = 5; // Amount of time (in seconds) spent waiting for Acrobat to open before closing it (feel free to adjust accordingly)
const waitingTimeForPrinter = 8; // Amount of time (in seconds) spent waiting for the Virtual PDF printer to virtually print 'step2.pdf' before continuing on (feel free to adjust accordingly)

// Steps 1 and 2
try {
    execSync(`gs -o step1.pdf -sDEVICE=pdfwrite -c "[ /PageMode /UseOutlines /Page 1 /View [/Fit] /PageLayout /SinglePage /DOCVIEW pdfmark" -f ${inputPDF}`); // Copy the input file as 'step1.pdf' and set the PDF document view options to open with bookmarks, start on page 1, fit the page to the window, and use a single page layout
    // If you don't want your document to display bookmarks, search this source code and replace "/UseOutlines" with "/UseNone" (for more info on PDF view options, visit https://thechriskent.com/2017/03/06/setting-pdf-view-options-with-pdfmark/)
    execSync("copy step1.pdf step2.pdf"); // Copy 'step1.pdf' as 'step2.pdf' to set the file title for the Virtual PDF printer
    exec("printStep2.bat"); // Virtually print 'step2.pdf' and save it in the 'Downloads' folder
    execSync(`ping 1.1.1.1 -n ${waitingTimeForAcrobat} > nul && taskkill /f /im Acrobat.exe && ping 1.1.1.1 -n ${waitingTimeForPrinter} > nul`); // Wait several seconds then exit Adobe Acrobat Pro and then wait several more seconds before continuing on
    execSync(`gs -o step2.pdf -sDEVICE=pdfwrite -c "[ /PageMode /UseOutlines /Page 1 /View [/Fit] /PageLayout /SinglePage /DOCVIEW pdfmark" -f ${userprofile}\\Downloads\\step2.pdf`); // Overwrite the 'step2.pdf' file in current directory
    execSync(`del ${userprofile}\\Downloads\\step2.pdf`); // Optionally delete the 'step2.pdf' file in the 'Downloads' folder
    console.log("\nSteps 1 and 2 are done!\n");
}	catch(error) {
    console.error(error);
}

// Step 3
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
const regex = new RegExp(/(?<=Page size:)(.*?)(?=pts)/, "g"); // Regex to search between "Page size:" and "pts" then return the page dimensions
const step1Metadata = String(execSync("pdfinfo step1.pdf"));
const step1Dimensions = removeWhitespaces(step1Metadata.match(regex)[0]);
const step1Width = Number(step1Dimensions.split("x")[0]);
const step1Height = Number(step1Dimensions.split("x")[1]);
const step2Metadata = String(execSync("pdfinfo step2.pdf"));
const step2Dimensions = removeWhitespaces(step2Metadata.match(regex)[0]);
const step2Width = Number(step2Dimensions.split("x")[0]);
const step2Height = Number(step2Dimensions.split("x")[1]);
const step3Width = desiredWidth;
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
if (step2Width / step2Height < step4Width / step4Height) {
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
        execSync("pdftk step4.pdf update_info empty-pdf-metadata output output.pdf"); // Optional document information dictionary metadata removal
        execSync("exiftool -all:all= -overwrite_original output.pdf"); // Optional (reversible) XMP metadata 'removal' (for more info on PDF metadata removal, visit https://gist.github.com/hubgit/6078384/)
        console.log("\nStep 4 is done!\n");
    }	catch(error) {
        console.error(error);
    }
}	else if (step2Width / step2Height > step4Width / step4Height) {
        const yCoordinate2 = step4Height;
        const yCoordinate1 = yCoordinate2 - step4Height;
        const step4Command = `gs
        -o step4.pdf
        -sDEVICE=pdfwrite
        -dDEVICEWIDTHPOINTS=${step4Width}
        -dDEVICEHEIGHTPOINTS=${step4Height + (step4Height - step3Height)}
        -dFIXEDMEDIA
        -dPDFFitPage
        -c "[/CropBox [${xCoordinate1} ${yCoordinate1} ${xCoordinate2} ${yCoordinate2}] /PAGES pdfmark"
        -c "[ /PageMode /UseOutlines /Page 1 /View [/Fit] /PageLayout /SinglePage /DOCVIEW pdfmark" ^
        -f step3.pdf`;
        try {
            execSync(step4Command.replace(/\n/g, " ^"));
            execSync("pdftk step4.pdf update_info empty-pdf-metadata output output.pdf"); // Optional document information dictionary metadata removal
            execSync("exiftool -all:all= -overwrite_original output.pdf"); // Optional (reversible) XMP metadata 'removal' (for more info on PDF metadata removal, visit https://gist.github.com/hubgit/6078384/)
            console.log("\nStep 4 is done!\n");
        }	catch(error) {
            console.error(error);
        }
}	

// Optionally log the dimensions of 'step1.pdf', 'step2.pdf', 'step3.pdf', and 'step4.pdf' and also log 'pdfinfo output.pdf'
console.log(`Dimensions of step1.pdf: ${step1Width} pt x ${step1Height} pt
\tWidth of step1.pdf: ${step1Width} pt
\tHeight of step1.pdf: ${step1Height} pt
\nDimensions of step2.pdf: ${step2Width} pt x ${step2Height} pt
\tWidth of step2.pdf: ${step2Width} pt
\tHeight of step2.pdf: ${step2Height} pt
\nDimensions of step3.pdf: ${step3Width} pt x ${roundNumber(step3Height)} pt
\tWidth of step3.pdf: ${step3Width} pt
\tHeight of step3.pdf: ${roundNumber(step3Height)} pt
\nDimensions of step4.pdf: ${step4Width} pt x ${step4Height} pt
\tWidth of step4.pdf: ${step4Width} pt
\tHeight of step4.pdf: ${step4Height} pt
\nPDF metadata of output.pdf:\n${String(execSync("pdfinfo output.pdf")).trim()}
`);

// // Optionally delete 'step1.pdf', 'step2.pdf', 'step3.pdf', and 'step4.pdf'
// execSync("del step1.pdf");
// execSync("del step2.pdf");
// execSync("del step3.pdf");
// execSync("del step4.pdf");