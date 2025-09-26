// 단기 토큰을 장기 토큰으로 교환
// 사용법: node scripts/exchange-token.js SHORT_TOKEN APP_ID APP_SECRET

const [shortToken, appId, appSecret] = process.argv.slice(2);

if (!shortToken || !appId || !appSecret) {
  console.log('사용법: node scripts/exchange-token.js SHORT_TOKEN APP_ID APP_SECRET');
  console.log('\nAPP_ID와 APP_SECRET은 Meta for Developers > 앱 설정 > 기본 설정에서 확인');
  process.exit(1);
}

async function exchangeToken() {
  try {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 장기 토큰 생성 성공!');
      console.log(`토큰: ${data.access_token}`);
      console.log(`만료: ${data.expires_in ? `${data.expires_in}초 후` : '만료되지 않음'}`);
      console.log(`\n.env.local에 다음을 추가하세요:`);
      console.log(`THREADS_ACCESS_TOKEN=${data.access_token}`);
    } else {
      console.error('❌ 오류:', data);
    }
  } catch (error) {
    console.error('❌ 네트워크 오류:', error.message);
  }
}

exchangeToken();