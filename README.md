# pdfChangePageDimensions
A command-line `Node.js` tool for Windows to change a PDF document's page dimensions while preserving the top, left, and right margins proportions (i.e., only the bottom margin proportion may change after the resizing) then strip the output PDF document's metadata afterwards.

## How to Use
`node pdfChangePageDimensions input.pdf <width>x<height>`

## Requirements and Dependencies
- [`Node.js`](https://nodejs.org/en/download/)
- [`pdfinfo` from Xpdf command-line tools](https://www.xpdfreader.com/download.html/)
- [`Ghostscript`](https://www.ghostscript.com/releases/gsdnld.html/)
- [`PDFtk Server`](https://www.pdflabs.com/tools/pdftk-server/)
- [`ExifTool`](https://exiftool.org/install.html)
- [`Adobe Acrobat Reader DC`](https://get.adobe.com/reader/) or [`Adobe Acrobat Pro DC`](https://www.adobe.com/acrobat.html)
- A Virtual PDF Printer to virtually print and embed fonts before resizing (I personally use [`Bullzip PDF Printer`](https://www.bullzip.com/products/pdf/download.php/))

## Installation and Prerequisites
1. Install `Node.js`, `pdfinfo`, `Ghostscript`, `PDFtk Server`, and `ExifTool` then [add their directories to the `PATH` environment variable](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee537574(v=office.14)).
2. Open your `Ghostscript`'s `bin` folder then copy `gswin64c.exe` and rename the copy as `gs.exe`.
3. Install your preferred Virtual PDF Printer and then [set it as your default printer in Windows](https://support.microsoft.com/en-us/windows/set-a-default-printer-in-windows-e10cf8b8-e596-b102-bf84-c41022b5036f)
4. Install either `Adobe Acrobat Reader DC` or `Adobe Acrobat Pro DC` then open any `*.pdf` document in `Acrobat` and go to the 'Print' window (CTRL+P).
5. Select your preferred Virtual PDF Printer then click 'Fit' under the 'Page sizing & Handling' section and make sure 'Choose paper source by PDF page size' is unticked.
6. Customize the rest of your 'Properties', 'Advanced', 'Page Setup...' settings per your needs (though I believe this `pdfChangePageDimensions.js` tool only works for PDF documents with a portrait orientation by default, but it shouldn't be too difficult to modify the source code to work for PDF documents with a landscape orientation)
7. Try virtually printing a `*.pdf` file to save your preferred settings and then check the font section of the result's document properties (CTRL+D) to check if the fonts are all embedded properly. 

## How It Works

### STEP 1

### STEP 2

### STEP 3

### STEP 4

## Example
