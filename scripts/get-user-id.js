// 임시 스크립트: User ID 확인
// 사용법: node scripts/get-user-id.js YOUR_ACCESS_TOKEN

const accessToken = process.argv[2];

if (!accessToken) {
  console.log('사용법: node scripts/get-user-id.js YOUR_ACCESS_TOKEN');
  process.exit(1);
}

async function getUserId() {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 사용자 정보:');
      console.log(`ID: ${data.id}`);
      console.log(`이름: ${data.name}`);
      console.log(`\n.env.local에 다음을 추가하세요:`);
      console.log(`THREADS_USER_ID=${data.id}`);
    } else {
      console.error('❌ 오류:', data);
    }
  } catch (error) {
    console.error('❌ 네트워크 오류:', error.message);
  }
}

getUserId();