import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testUrls() {
  const urls = [
    'https://bbs.ruliweb.com/search?q=test',
    'https://bbs.ruliweb.com/community/board/300143',
    'https://bbs.ruliweb.com/best/selection',
    'https://bbs.ruliweb.com/',
  ];

  for (const url of urls) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
        timeout: 10000,
      });
      console.log(`✅ SUCCESS - Status: ${response.status}, Length: ${response.data.length}`);
    } catch (error) {
      if (error.response) {
        const body = String(error.response.data).substring(0, 50);
        console.log(`❌ FAILED - Status: ${error.response.status}, Body: ${body}`);
      } else {
        console.log(`❌ ERROR - ${error.message}`);
      }
    }
  }
}

testUrls();
