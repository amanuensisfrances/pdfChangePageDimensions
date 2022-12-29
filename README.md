# pdfChangePageDimensions
A `Node.js` Windows command-line tool used for changing a PDF document's page dimensions (measured in `pts`) while preserving the top, left, and right margins proportions (i.e., only the bottom margin proportion may change after the resizing) and *optionally* removing the output PDF document's metadata afterwards.

## How to Use
`node pdfChangePageDimensions.js <inputPDF> <desiredWidth>x<desiredHeight>`

## Requirements and Dependencies
- [`Node.js`](https://nodejs.org/en/download/)
- [`pdfinfo` from Xpdf command-line tools](https://www.xpdfreader.com/download.html/)
- [`Ghostscript`](https://www.ghostscript.com/releases/gsdnld.html/)
- [`PDFtk Server`](https://www.pdflabs.com/tools/pdftk-server/)
- [`ExifTool`](https://exiftool.org/install.html/)
- [`Adobe Acrobat Reader DC`](https://get.adobe.com/reader/) or [`Adobe Acrobat Pro DC`](https://www.adobe.com/acrobat.html/)
- A Virtual PDF Printer to virtually (re)print the input PDF document and embed the fonts before resizing (I personally use [`Bullzip PDF Printer`](https://www.bullzip.com/products/pdf/download.php/))

## Installation and Setup
1. Install `Node.js`, `pdfinfo`, `Ghostscript`, `PDFtk Server`, `ExifTool`, and either `Adobe Acrobat Reader DC` or `Adobe Acrobat Pro DC` then [add all their directories to the `PATH` environment variable](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee537574(v=office.14)/).

2. Open your `Ghostscript`'s `bin` folder then copy `gswin64c.exe` as `gs.exe`.

3. Install your preferred Virtual PDF Printer and then [set it as your default printer in Windows](https://support.microsoft.com/en-us/windows/set-a-default-printer-in-windows-e10cf8b8-e596-b102-bf84-c41022b5036f/).

4. Change your Virtual PDF Printer settings such that:
- [The default output directory/destination folder is `C:Users\<username>\Downloads` and the default output file name will be the same as the input file name.](https://github.com/amanuensisfrances/pdfChangePageDimensions/blob/main/Images/General.png/)
- [No dialog/popup appears during document creation.](https://github.com/amanuensisfrances/pdfChangePageDimensions/blob/main/Images/Dialogs.png/)
- [PDF Quality is set to default.](https://github.com/amanuensisfrances/pdfChangePageDimensions/blob/main/Images/Document.png/)
- [Neither the output directory/destination folder nor the output file will be opened after document creation.](https://github.com/amanuensisfrances/pdfChangePageDimensions/blob/main/Images/Actions.png/)

5. [Open any `*.pdf` document in `Acrobat Reader` or `Acrobat Pro`, go to the 'Print' window (`CTRL+P`) and select your preferred Virtual PDF Printer then click 'Fit' under the 'Page sizing & Handling' section and make sure 'Choose paper source by PDF page size' is unticked. Also make sure the output document will be vertically centered](https://github.com/amanuensisfrances/pdfChangePageDimensions/blob/main/Images/Adobe%20Acrobat%20Print%20Window.png/).

6. Customize the rest of your 'Properties', 'Advanced', 'Page Setup...' settings as per your needs (I believe this `pdfChangePageDimensions.js` tool only works for PDF documents with a portrait orientation by default, but it shouldn't be too difficult to modify the source code to work for PDF documents with a landscape orientation).

7. Try virtually printing a `*.pdf` file to save your preferred settings and then check the 'Fonts' section of the result's document properties (`CTRL+D`) to make sure the fonts are all embedded properly. 

8. If you're using `Adobe Acrobat Pro`, download and extract `withAcrobatPro` from the [latest `pdfChangePageDimensions` release](https://github.com/amanuensisfrances/pdfChangePageDimensions/releases/) and if you're using `Adobe Acrobat Reader`, download and extract `withAcrobatReader` instead.

9. Run `node pdfChangePageDimensions.js <inputPDF> <desiredWidth>x<desiredHeight>` in the command-line to check if everything works correctly. If it returns an error, try adjusting `waitingTimeForPrinter` in the source code of `pdfChangePageDimensions.js` and try again.

## How It Works

### STEP 1
Using `Ghostscript`, the tool creates a copy of your `<inputPDF>` file as `step1.pdf` and sets the PDF document view options to open with bookmarks, start on page 1, fit the page to the window, and use a single page layout. If you don't want your document to display bookmarks, search the source code of `pdfChangePageDimensions.js` and replace `/UseOutlines` with `/UseNone`. You can read more about PDF view options [here](https://thechriskent.com/2017/03/06/setting-pdf-view-options-with-pdfmark/).

### STEP 2
Then, the tool creates a copy of your `step1.pdf` file as `step2.pdf` to set the file name for the virtually printed PDF document with embedded fonts. Here the tool will execute the `printStep2.bat` batch script which will open the 'Print' window for `step2.pdf` in either `Acrobat.exe` or `AcroRd32.exe`, wait a few seconds for it to open, then send the keystroke `ENTER` using [`SendKeys`](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/windows-scripting/8c6yea83(v=vs.84)/) to start the virtual PDF printing process. Simultaneously, the tool will wait for `waitingTimeForAcrobat` seconds as soon as the `printStep2.bat` batch script is run before closing `Acrobat.exe` or `AcroRd32.exe`, then wait another `waitingTimeForPrinter` seconds for the Virtual PDF Printer to finish virtually printing `step2.pdf` which will be saved in `C:Users\<username>\Downloads`. The tool then overwrites the `step2.pdf` in the current directory with `C:Users\<username>\Downloads\step2.pdf` and *optionally* deletes `C:Users\<username>\Downloads\step2.pdf`.

### STEP 3
In this step, the tool will use `pdfinfo` to return the PDF metadata for `step1.pdf` and `step2.pdf` respectively, then searches the metadata string for the corresponding page dimensions (`step1Width`, `step1Height`, `step2Width`, and `step2Height`) by using the regular expression `/(?<=Page size:)(.*?)(?=pts)/g`.
Afterwards, the tool calculates `step3Width` and `step3Height` in terms of the inserted `desiredWidth` and also creates the variables `step4Width = desiredWidth` and `step4Height = desiredHeight`. At this point, the tool will run a `Ghostscript` command to create `step3.pdf` that essentially scales `step2.pdf` until it has the same width as `desiredWidth` but a different height from `desiredHeight`.

### STEP 4
Finally, the tool calculates the coordinates which will be used in a `Ghostscript` command to create `step4.pdf` that essentially crops `step3.pdf` in such a way that will preserve top, left, and right margins proportions of the original `input.pdf`/`step1.pdf` document and such that the bottom margin proportion will be the only one that can vary if the desired aspect ratio `desiredWidth/desiredHeight` is not equal to the original `step1Width/step1Height`. *Optionally*, the tool will copy `step4.pdf` as `output.pdf`,  remove the document information dictionary metadata by using `PDFtk Server`, and (reversibly) 'remove' the XMP metadata by using `ExifTool`. You can read more about PDF metadata removal [here](https://gist.github.com/hubgit/6078384). The tool then ends by *optionally* logging the dimensions of `step1.pdf`, `step2.pdf`, `step3.pdf`, and `step4.pdf` and also by logging `pdfinfo output.pdf`.

## Example
### CASE 1 (`step2Width / step2Height < step4Width / step4Height`)

### CASE 2 (`step2Width / step2Height > step4Width / step4Height`)

## Some Side Notes
I am aware that I can shorten the tool's source code by essentially merging steps 3 and 4 into a single step but I personally still prefer the tool having 4 steps because it is easier for me to visualize each step and makes certain calculations more readable. For example, I declared `step3Height` and assigned `(desiredWidth / step2Width) * step2Height` to it to make the calculation of `yCoordinate2` (in the case where `step2Width / step2Height < step4Width / step4Height`) more legible with `yCoordinate2 = (step3Height - (step3Height - ((step4Width / step1Width) * step1Height)) / 2)` as opposed to the expanded `yCoordinate2 = ((desiredWidth / step2Width) * step2Height - ((desiredWidth / step2Width) * step2Height - ((step4Width / step1Width) * step1Height)) / 2)`.

Also, this is my first ever amateur project and GitHub repository so any feedback and constructive criticism would be welcome. I initially searched for a command-line tool that can easily automate changing the page dimensions of PDF documents (with the fonts embedded) while preserving the top, left, and right margins proportions but to no avail. I am sure that someone else can definitely write a better and less-flawed version of something that this tool merely attempts to achieve. I am not personally fluent in `JavaScript` and `Node.js` nor in any of the command-line tools used here as I am still self-learning from time to time at my own pace. I only know some things from my experience in searching online and I am very grateful to all the resources and Q&A sites like the Stack Exchange Network that have helped my learning process.
