import express from 'express';
import path from 'path';

const router = express.Router();

// Serve PDF files
router.get('/pdfs/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(process.cwd(), 'uploads', 'pdfs', filename);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filepath);
});

export const PdfRoutes = router;
