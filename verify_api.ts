
import "dotenv/config";

async function verifyAPI() {
    try {
        const port = process.env.PORT || 3000;
        const url = `http://localhost:${port}/api/advertisers/with-active-tasks`;
        console.log(`--- Fetching from ${url} ---`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        const samsung = (data as any[]).find((a: any) => a.nameEn === 'Samsung Egypt');
        if (samsung) {
            console.log('✅ Samsung Egypt found in API response!');
            console.log('Logo URL:', samsung.logoUrl);
            console.log('Active Task Count:', samsung.activeTaskCount);
        } else {
            console.log('❌ Samsung Egypt NOT found in API response.');
        }

        process.exit(0);
    } catch (err) {
        console.error('API Verification failed:', err);
        process.exit(1);
    }
}

verifyAPI();
