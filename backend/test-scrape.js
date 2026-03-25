const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    const url = 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT';
    console.log('Fetching:', url);
    
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('\n=== PAGE TITLE ===');
    console.log($('title').text());
    
    console.log('\n=== HEADINGS (h2, h3) ===');
    $('h2, h3').slice(0, 10).each((i, elem) => {
      console.log('-', $(elem).text().trim());
    });
    
    console.log('\n=== ALL LINKS ===');
    $('a').slice(0, 15).each((i, elem) => {
      const text = $(elem).text().trim();
      const href = $(elem).attr('href');
      if (text && text.length > 0) {
        console.log(`- ${text.substring(0, 50)} → ${href}`);
      }
    });
    
    console.log('\n=== STRONG/BOLD TEXT (Estructura de Carreras) ===');
    $('strong, b').slice(0, 15).each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 5) {
        console.log('-', text.substring(0, 60));
      }
    });

    console.log('\n=== PÁRRAFOS CON CONTENIDO (ul, li, p) ===');
    const content = [];
    $('main, .content, article, [role="main"]').each((i, section) => {
      const text = $(section).text().trim().substring(0, 500);
      if (text.length > 50) {
        console.log(text);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
