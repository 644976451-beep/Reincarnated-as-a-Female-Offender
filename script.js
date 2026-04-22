// 語言翻譯對象
const translations = {
    en: {
        title: "10 Years Hong Kong Female Crime Portrait",
        subtitle: "Interactive Data Visualization (2014-2024)",
        headerTitle: "Reincarnated as a Female Offender",
        headerDescription: "Enter your age to discover what crime you might commit based on real Hong Kong data from 2014-2024.",
        ageLabel: "Your Age:",
        generateBtn: "Generate My Crime Profile",
        resultTitle: "Your Crime Profile",
        disclaimer: "Note: This is based on statistical data for educational purposes only. It does not predict individual behavior.",
        dataSource1: "Hong Kong Police Force Annual Reports (2014-2024)",
        dataSource2: "Correctional Services Department Statistics",
        footerText: "Created for AIDM7410 Term Project | HKBU School of Communication"
    },
    zh: {
        title: "十年香港女子犯罪肖像",
        subtitle: "互動數據可視化 (2014-2024)",
        headerTitle: "轉生成為女犯罪者",
        headerDescription: "輸入你的年齡，根據2014-2024年香港真實數據，看看你可能會犯什麼罪。",
        ageLabel: "你的年齡：",
        generateBtn: "生成我的犯罪檔案",
        resultTitle: "你的犯罪檔案",
        disclaimer: "註：此結果僅基於統計數據用於教育目的，不預測個人行為。",
        dataSource1: "香港警務處年報 (2014-2024)",
        dataSource2: "懲教署統計數據",
        footerText: "為AIDM7410學期項目製作 | 香港浸會大學傳理學院"
    }
};

// 犯罪類型映射（中英文對應）
const crimeTypes = {
    en: {
        theft: 'Theft',
        drug: 'Drug-related Offences',
        fraud: 'Fraud',
        assault: 'Common Assault',
        illegalEntry: 'Illegal Entry',
        criminalDamage: 'Criminal Damage',
        other: 'Other Offences'
    },
    zh: {
        theft: '盜竊',
        drug: '毒品相關罪行',
        fraud: '欺詐',
        assault: '普通襲擊',
        illegalEntry: '非法入境',
        criminalDamage: '刑事毀壞',
        other: '其他罪行'
    }
};

// 全局數據變量
let arrestData = [];
let prisonDataByAge = [];
let prisonDataByOffence = [];

// DOM 元素
const langEnBtn = document.getElementById('lang-en');
const langZhBtn = document.getElementById('lang-zh');
const ageInput = document.getElementById('age-input');
const ageSlider = document.getElementById('age-slider');
const ageDisplay = document.getElementById('age-display');
const generateBtn = document.getElementById('generate-btn');
const resultSection = document.getElementById('result-section');
const crimeProbabilities = document.getElementById('crime-probabilities');
const resultAge = document.getElementById('result-age');

// 當前語言
let currentLang = 'zh';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 設置事件監聽器
    setupEventListeners();
    
    // 載入數據
    loadData();
    
    // 初始化UI
    updateLanguageUI();
});

// 設置事件監聽器
function setupEventListeners() {
    langEnBtn.addEventListener('click', () => changeLanguage('en'));
    langZhBtn.addEventListener('click', () => changeLanguage('zh'));
    
    ageInput.addEventListener('input', (e) => {
        let value = e.target.value;
        if (value === '') return;
        value = Math.max(10, Math.min(80, parseInt(value) || 10));
        ageInput.value = value;
        ageSlider.value = value;
        ageDisplay.textContent = value;
    });
    
    ageSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        ageInput.value = value;
        ageDisplay.textContent = value;
    });
    
    generateBtn.addEventListener('click', generateCrimeProfile);
    
    // 阻止表單提交
    document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());
}

// 改變語言
function changeLanguage(lang) {
    currentLang = lang;
    langEnBtn.classList.toggle('active', lang === 'en');
    langZhBtn.classList.toggle('active', lang === 'zh');
    updateLanguageUI();
}

// 更新UI語言
function updateLanguageUI() {
    // 更新標題
    document.querySelector('.logo h1').textContent = translations[currentLang].title;
    document.querySelector('.logo p').textContent = translations[currentLang].subtitle;
    
    // 更新介紹部分
    document.querySelector('.intro h2').textContent = translations[currentLang].headerTitle;
    document.querySelector('.intro p').textContent = translations[currentLang].headerDescription;
    
    // 更新輸入部分
    document.querySelector('label[for="age-input"]').textContent = translations[currentLang].ageLabel;
    generateBtn.textContent = translations[currentLang].generateBtn;
    
    // 更新結果部分
    document.querySelector('.result-header h3').textContent = translations[currentLang].resultTitle;
    document.querySelector('.disclaimer p').textContent = translations[currentLang].disclaimer;
    
    // 更新數據來源
    document.querySelectorAll('.data-source li')[0].textContent = translations[currentLang].dataSource1;
    document.querySelectorAll('.data-source li')[1].textContent = translations[currentLang].dataSource2;
    
    // 更新頁腳
    document.querySelector('footer p').textContent = translations[currentLang].footerText;
    
    // 如果結果已顯示，重新生成
    if (resultSection.style.display !== 'none') {
        generateCrimeProfile();
    }
}

// 載入CSV數據
async function loadData() {
    try {
        // 載入Table 1 - 按年齡和性別劃分的被捕人數
        const arrestResponse = await fetch('original_dataTable1_Cleaned_Arrest_Data.csv');
        const arrestText = await arrestResponse.text();
        arrestData = parseCSV(arrestText);
        
        // 載入Table 3 - 按年齡劃分的監獄收容人數
        const prisonAgeResponse = await fetch('original_dataTable3_Prison_Admissions_by_Age.csv');
        const prisonAgeText = await prisonAgeResponse.text();
        prisonDataByAge = parseCSV(prisonAgeText);
        
        // 載入Table 4 - 按罪行劃分的監獄收容人數
        const prisonOffenceResponse = await fetch('original_dataTable4_Prison_Admissions_by_Offence.csv');
        const prisonOffenceText = await prisonOffenceResponse.text();
        prisonDataByOffence = parseCSV(prisonOffenceText);
        
        console.log('數據載入成功:', {
            arrestData: arrestData.length,
            prisonDataByAge: prisonDataByAge.length,
            prisonDataByOffence: prisonDataByOffence.length
        });
        
    } catch (error) {
        console.error('載入數據時出錯:', error);
        alert('無法載入數據文件，請檢查文件是否正確放置在文件夾中');
    }
}

// 解析CSV數據
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length === headers.length) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = values[j];
            }
            data.push(obj);
        }
    }
    
    return data;
}

// 生成犯罪檔案
function generateCrimeProfile() {
    const age = parseInt(ageInput.value);
    if (isNaN(age) || age < 10 || age > 80) {
        alert('請輸入10-80之間的有效年齡');
        return;
    }
    
    // 顯示結果區域
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // 更新年齡顯示
    resultAge.textContent = currentLang === 'en' ? `${age} years old` : `${age}歲`;
    
    // 計算犯罪概率
    const crimeProbabilitiesData = calculateCrimeProbabilities(age);
    
    // 顯示結果
    displayCrimeProbabilities(crimeProbabilitiesData);
}

// 計算犯罪概率
function calculateCrimeProbabilities(age) {
    // 獲取對應的年齡組
    const ageGroup = getAgeGroup(age);
    
    // 基於真實數據計算概率（這裡是示例數據，你可以根據實際數據調整）
    const baseProbabilities = [
        { crimeKey: 'theft', probability: 28.5 },
        { crimeKey: 'drug', probability: 22.3 },
        { crimeKey: 'fraud', probability: 18.7 },
        { crimeKey: 'assault', probability: 12.4 },
        { crimeKey: 'illegalEntry', probability: 8.9 },
        { crimeKey: 'criminalDamage', probability: 5.2 },
        { crimeKey: 'other', probability: 4.0 }
    ];
    
    // 根據年齡調整概率（示例邏輯）
    if (age < 21) {
        baseProbabilities[0].probability += 5; // 增加盜竊/ Theft概率
        baseProbabilities[1].probability -= 3; // 減少毒品/ Drug概率
    } else if (age > 40) {
        baseProbabilities[2].probability += 8; // 增加欺詐/ Fraud概率
        baseProbabilities[0].probability -= 5; // 減少盜竊/ Theft概率
    }
    
    // 重新計算總和為100%
    const total = baseProbabilities.reduce((sum, item) => sum + item.probability, 0);
    const crimeProbabilities = baseProbabilities.map(item => {
        return {
            crimeKey: item.crimeKey,
            crime: crimeTypes[currentLang][item.crimeKey],
            probability: (item.probability / total * 100).toFixed(1)
        };
    });
    
    return crimeProbabilities;
}

// 獲取年齡組
function getAgeGroup(age) {
    if (age <= 15) return '15歲以下';
    if (age <= 20) return '16-20歲';
    if (age <= 25) return '21-25歲';
    if (age <= 30) return '26-30歲';
    if (age <= 40) return '31-40歲';
    if (age <= 50) return '41-50歲';
    if (age <= 60) return '51-60歲';
    return '61歲及以上';
}

// 顯示犯罪概率
function displayCrimeProbabilities(data) {
    crimeProbabilities.innerHTML = '';
    
    data.forEach((item, index) => {
        const crimeItem = document.createElement('div');
        crimeItem.className = 'crime-item';
        
        // 根據語言選擇概率文本
        const probabilityText = currentLang === 'en' 
            ? `${item.probability}% probability`
            : `${item.probability}% 概率`;
        
        crimeItem.innerHTML = `
            <div class="crime-name">
                <h4>${item.crime}</h4>
                <span>${item.probability}%</span>
            </div>
            <div class="probability-bar">
                <div class="probability-fill" style="width: 0%"></div>
            </div>
            <div class="probability-text">${probabilityText}</div>
        `;
        
        crimeProbabilities.appendChild(crimeItem);
        
        // 動畫效果
        setTimeout(() => {
            const fillBar = crimeItem.querySelector('.probability-fill');
            fillBar.style.width = `${item.probability}%`;
        }, 100 * (index + 1));
    });
}

// 簡單的AJAX函數（如果需要）
function ajaxGet(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(null, xhr.responseText);
            } else {
                callback(new Error('無法載入文件: ' + xhr.status));
            }
        }
    };
    xhr.send();
}