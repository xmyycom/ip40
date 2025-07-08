document.addEventListener('DOMContentLoaded', async () => {
    const resultDiv = document.getElementById('result');
    const ipInput = document.getElementById('ipInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    // const proxyServer = "https://some-proxy.com"
    const proxyServer = "https://xmstc.com"
    try {
        const response = await fetch('https://ipinfo.io/ip');
        const ip = await response.text();
        resultDiv.innerHTML = `您的当前IP是: ${ip}`;
        const ipDetailsResponse = await fetch(`${proxyServer}/proxy/ip?ip=${ip}`);
        // const ipDetailsResponse = await fetch(`${proxyServer}/${ip}`);
        if (!ipDetailsResponse.ok) {
            throw new Error('Failed to fetch IP details.');
        }
        const ipDetails = await ipDetailsResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(ipDetails, 'text/html');
        // const addressDiv = doc.querySelector('tbody tr:nth-child(2) div:nth-child(1)');
        const addressDiv = doc.querySelector('tr[class="active"] td span');
        if (!addressDiv) {
            throw new Error('Failed to find addressDiv element.');
        }
        // const addressText = addressDiv.textContent.trim();
        const addressText = addressDiv ? addressDiv.textContent.trim() : '';
        resultDiv.innerHTML += `，您来自: ${addressText}。`;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML += '，获取IP归属地失败！';
    }
    lookupBtn.addEventListener('click', async () => {
        const ipAddress = ipInput.value.trim();
        const validIPRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (validIPRegex.test(ipAddress)) {
            loadingIndicator.classList.remove('hidden');
            try {
                // const response = await fetch(`${proxyServer}/proxy/ip?ip=${ipAddress}`);
                // const response = await fetch(`${proxyServer}/?inputSearch=${ipAddress}`);
                const response = await fetch(`${proxyServer}/proxy/ip?ip=${ipAddress}`, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'text/html',
                    },
                    credentials: 'omit' // 除非需要cookies，否则使用omit
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                // const addressDiv = doc.querySelector('tbody tr:first-child td:nth-child(3)');
                const addressDiv = doc.querySelector('tr[class="active"] td span');
                const addressText = addressDiv ? addressDiv.textContent.trim() : '';
                resultDiv.innerHTML = `您查询的IP: ${ipAddress}，其归属地为：${addressText}。`;
                loadingIndicator.classList.add('hidden');
            } catch (error) {
                console.error(error);
                resultDiv.innerHTML = `您查询的IP: ${ipAddress}，获取IP归属地失败！`;
                loadingIndicator.classList.add('hidden');
            }
        } else {
            resultDiv.innerHTML = '您输入的IP地址格式不正确，请检查后重试。';
            loadingIndicator.classList.add('hidden');
        }
    });
});