import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Pant Server aktif di http://localhost:${PORT}`);
});
