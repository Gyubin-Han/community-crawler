import { sendPostsToAPI, healthCheck } from './utils/api-client.js';
import type { Post } from './types.js';

console.log('=== API Connection Test ===\n');

// 1. Health Check
console.log('1. Testing API health check...');
const healthy = await healthCheck();
console.log(`   Result: ${healthy ? '✅ API is healthy' : '❌ API is not reachable'}\n`);

if (!healthy) {
  console.log('⚠️  Make sure Spring Boot is running on port 8080');
  console.log('   Run: cd backend && mvnw spring-boot:run\n');
  process.exit(1);
}

// 2. Send Test Data
console.log('2. Sending test post...');
const testPost: Post = {
  id: 'crawler-test-' + Date.now(),
  title: '크롤러 API 연동 테스트',
  author: '테스터',
  community: 'test',
  board: '테스트 게시판',
  content: '크롤러에서 API로 데이터 전송 테스트입니다.',
  views: 0,
  comments: 0,
  likes: 0,
  timestamp: new Date().toISOString(),
  url: 'https://test.com/test',
};

const success = await sendPostsToAPI([testPost]);

if (success) {
  console.log('\n✅ Test completed successfully!');
  console.log('   Check the database or frontend to see the test post.');
} else {
  console.log('\n❌ Test failed!');
  console.log('   Check the error messages above.');
}
