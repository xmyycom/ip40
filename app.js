document.addEventListener('DOMContentLoaded', async () => {
    const resultDiv = document.getElementById('result');
    const ipInput = document.getElementById('ipInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const proxyServer = "https://file.xyj321.com"
    try {
        const response = await fetch('https://ipinfo.io/ip');
        const ip = await response.text();
        resultDiv.innerHTML = `您的当前IP是: ${ip}`;
        const ipDetailsResponse = await fetch(`${proxyServer}/proxy/query?ip=${ip}`);
        if (!ipDetailsResponse.ok) {
            throw new Error('Failed to fetch IP details.');
        }
        const ipDetails = await ipDetailsResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(ipDetails, 'text/html');
        const addressDiv = doc.querySelector('tbody tr:first-child td:nth-child(3)');
        if (!addressDiv) {
            throw new Error('Failed to find addressDiv element.');
        }
        const addressText = addressDiv.textContent.trim();
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
                const response = await fetch(`${proxyServer}/proxy/query?ip=${ipAddress}`);
                const data = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const addressDiv = doc.querySelector('tbody tr:first-child td:nth-child(3)');
                const addressText = addressDiv ? addressDiv.textContent.trim() : '';
                resultDiv.innerHTML = `您查询的IP: ${ipAddress}，其归属地为：${addressText}。`;
                loadingIndicator.classList.add('hidden');
            } catch (error) {
                resultDiv.innerHTML = `您查询的IP: ${ipAddress}，获取IP归属地失败！`;
                loadingIndicator.classList.add('hidden');
            }
        } else {
            resultDiv.innerHTML = '您输入的IP地址格式不正确，请检查后重试。';
            loadingIndicator.classList.add('hidden');
        }
    });
});