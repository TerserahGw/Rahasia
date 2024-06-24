import express, { Request, Response } from 'express';
import cron from 'node-cron';
import { NHentai } from '@shineiichijo/nhentai-ts';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const user_agent = 'User Agent';
const cookie_value = 'cf_clearance=abcdefghijklmnopq';
const nhentai = new NHentai({ site: 'nhentai.net', user_agent, cookie_value });

const app = express();
const port = 3000;

// Create __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let latestData: any = null;

// Schedule the first async function to run every minute
cron.schedule('* * * * *', async () => {
  try {
    const { data } = await nhentai.explore();
    latestData = data;
    console.log('Updated latest data:', latestData);
  } catch (error) {
    console.error('Error exploring nhentai:', error);
  }
});

// Create an endpoint that triggers the second async function
app.get('/doujin', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).send('Query parameter "q" is required');
  }

  try {
    const { data } = await nhentai.search(query, { page: 1 });
    if (data.length === 0) {
      return res.status(404).send('No doujin found for the given query');
    }

    const doujin = data[0];
    const { images } = await doujin.getContents();

    const pdfFilename = path.join(__dirname, `${query}.pdf`);
    await images.PDF(pdfFilename);

    const pdfUrl = `${req.protocol}://${req.get('host')}/${path.basename(pdfFilename)}`;
    res.json({ pdfUrl });
  } catch (error) {
    console.error('Error searching nhentai:', error);
    res.status(500).send('Error searching nhentai');
  }
});

// Serve generated PDF files
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
