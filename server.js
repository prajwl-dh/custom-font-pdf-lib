/*
  How to use:
  - Clone this project
  - open terminal inside the folder 
  - npm install
  - in terminal : npm run start
*/

/*
  Test Payload via postman or any other tester.
  Url : http://localhost:3000/pdf
 
  Sample Raw Json Body Payload:
  {
    "name": "\u0003Prajwal \u0002Dhungana!@#$%^&*()_+<.?;}{👋🔎ÁÑÓÚÜüúóñáéíñ٣٣"
  }
 
*/

const express = require('express');
const bodyParser = require('body-parser');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const fontKit = require('@pdf-lib/fontkit');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the /pdf endpoint
app.post('/pdf', async (req, res) => {
  try {
    // Get the name from the request body
    const { name } = req.body;
    if (!name) {
      return res.status(400).send('Name is required');
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontKit);

    // Load the font file
    const fontPath = path.join(__dirname, 'fonts', 'ArialCE.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const pdfFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const fontSize = 10;

    // Draw the name on the page
    page.drawText(name, {
      x: width / 2 - 100,
      y: height / 2,
      size: fontSize,
      font: pdfFont,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    // Convert PDF bytes to Base64
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    // Send the Base64 encoded PDF as the response
    res.status(200).json({ pdf: base64Pdf });
  } catch (error) {
    console.error('Error creating PDF:', error);
    res.status(500).send('An error occurred while creating the PDF');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
