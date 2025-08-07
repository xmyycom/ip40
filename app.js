document.addEventListener('DOMContentLoaded', async () => {
    const resultDiv = document.getElementById('result');
    const ipInput = document.getElementById('ipInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const proxyServer = "https://xmstc.com"
    
    // Display result with fade-in animation instead of typing effect
    function displayResultWithAnimation(element, htmlContent) {
        // Add fade out effect
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            // Set the HTML content directly
            element.innerHTML = htmlContent;
            // Fade in the new content
            element.style.opacity = '1';
        }, 150);
    }
    
    // Enhanced result display with icons and styling
    function displayResult(ip, location, isCurrentIP = false) {
        const icon = isCurrentIP ? '<i class="fas fa-map-marker-alt" style="color: #40e0d0; margin-right: 8px;"></i>' : '<i class="fas fa-search-location" style="color: #8a2be2; margin-right: 8px;"></i>';
        const prefix = isCurrentIP ? '您的当前IP是' : '查询IP';
        const htmlContent = `${icon}${prefix}: <span style="color: #40e0d0; font-weight: 600;">${ip}</span>${location ? `，归属地: <span style="color: #8a2be2; font-weight: 600;">${location}</span>` : ''}`;
        displayResultWithAnimation(resultDiv, htmlContent);
    }
    
    // Add input validation styling
    function validateIP(ip) {
        const validIPRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return validIPRegex.test(ip);
    }
    
    // Add real-time input validation
    ipInput.addEventListener('input', () => {
        const ip = ipInput.value.trim();
        const inputGroup = ipInput.parentElement;
        
        if (ip === '') {
            inputGroup.style.borderColor = 'rgba(64, 224, 208, 0.3)';
            return;
        }
        
        if (validateIP(ip)) {
            inputGroup.style.borderColor = '#40e0d0';
            inputGroup.style.boxShadow = '0 0 20px rgba(64, 224, 208, 0.2)';
        } else {
            inputGroup.style.borderColor = '#ff6b6b';
            inputGroup.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)';
        }
    });
    
    // Add Enter key support
    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            lookupBtn.click();
        }
    });
    
    try {
        // Show loading for initial IP fetch
        displayResultWithAnimation(resultDiv, '<i class="fas fa-satellite-dish" style="color: #40e0d0; margin-right: 8px;"></i>正在获取您的IP信息...');
        
        const response = await fetch('https://ipinfo.io/ip');
        const ip = await response.text();
        
        const ipDetailsResponse = await fetch(`${proxyServer}/proxy/ip?ip=${ip}`);
        if (!ipDetailsResponse.ok) {
            throw new Error('Failed to fetch IP details.');
        }
        const ipDetails = await ipDetailsResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(ipDetails, 'text/html');
        const addressDiv = doc.querySelector('tr[class="active"] td span');
        const addressText = addressDiv ? addressDiv.textContent.trim() : '';
        // 获取所有tr
        const trs = doc.querySelectorAll('tbody tr');
        let operatorText = '';
        // 遍历tr查找运营商
        trs.forEach(tr => {
            if (tr.querySelector('.th') && tr.querySelector('.th').textContent === '运营商') {
                operatorText = tr.querySelector('td:not(.th)').textContent;
                // console.log('Debug: operatorText =', operatorText);
                if (addressDiv) {
                    addressDiv.textContent = `${addressText}${' '.repeat(2)}${operatorText}`;
                    // console.log('Debug: addressDiv after=', addressDiv.textContent);
                }
            }
        });
        const finalText = addressDiv ? addressDiv.textContent : addressText;
        // console.log('Debug: finalText =', finalText);
        displayResult(ip, finalText, true);
    } catch (error) {
        console.error(error);
        displayResultWithAnimation(resultDiv, '<i class="fas fa-exclamation-triangle" style="color: #ff6b6b; margin-right: 8px;"></i>获取IP信息失败，请稍后重试');
    }
    lookupBtn.addEventListener('click', async () => {
        const ipAddress = ipInput.value.trim();
        
        if (!validateIP(ipAddress)) {
            displayResultWithAnimation(resultDiv, '<i class="fas fa-exclamation-circle" style="color: #ff6b6b; margin-right: 8px;"></i>IP地址格式不正确，请输入有效的IP地址');
            // Add shake animation to input
            ipInput.parentElement.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                ipInput.parentElement.style.animation = '';
            }, 500);
            return;
        }
        
        // Disable button and show loading
        lookupBtn.disabled = true;
        lookupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
        loadingIndicator.classList.remove('hidden');
        
        try {
            const response = await fetch(`${proxyServer}/proxy/ip?ip=${ipAddress}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/html',
                },
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const addressDiv = doc.querySelector('tr[class="active"] td span');
            const addressText = addressDiv ? addressDiv.textContent.trim() : '未知';
            
            displayResult(ipAddress, addressText, false);
            
        } catch (error) {
            console.error(error);
            displayResultWithAnimation(resultDiv, `<i class="fas fa-exclamation-triangle" style="color: #ff6b6b; margin-right: 8px;"></i>查询IP: <span style="color: #40e0d0; font-weight: 600;">${ipAddress}</span> 失败，请稍后重试`);
        } finally {
            // Re-enable button and hide loading
            lookupBtn.disabled = false;
            lookupBtn.innerHTML = '<span class="btn-text">查询</span><i class="fas fa-arrow-right btn-icon"></i>';
            loadingIndicator.classList.add('hidden');
        }
    });
});