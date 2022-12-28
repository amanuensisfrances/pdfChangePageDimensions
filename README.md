# pdfChangePageDimensions
A command-line Node.js tool for Windows to change PDF page dimensions while preserving the top, left, and right margins proportions (i.e., only the bottom margin proportion may change after the resizing) then strip the metadata.

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
1. Install `Node.js`, `pdfinfo`, `Ghostscript`, `PDFtk Server`, and `ExifTool` then [add their directories to the `PATH` environment variable](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee537574(v=office.14))
2. Install either `Adobe Acrobat Reader DC` or `Adobe Acrobat Pro DC` then 

## How It Works

## Example
