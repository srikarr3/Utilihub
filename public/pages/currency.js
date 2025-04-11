document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const convertButton = document.getElementById('convert-btn');
    const errorMessage = document.querySelector('.error-message');
    const currencyResult = document.querySelector('.currency-result');
    const conversionResult = document.querySelector('.conversion-result');
    const conversionDetails = document.querySelector('.conversion-details');
    const rateHistoryChart = document.getElementById('rateHistoryChart');
    const lastUpdate = document.getElementById('last-update');

    // Event listeners
    convertButton.addEventListener('click', convertCurrency);
    fromCurrency.addEventListener('change', convertCurrency);
    toCurrency.addEventListener('change', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);

    // Convert currency
    async function convertCurrency() {
        const amount = amountInput.value;
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (!amount || amount <= 0) {
            showError('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch('/api/currency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from,
                    to,
                    amount: parseFloat(amount)
                })
            });

            const data = await response.json();

            if (data.error) {
                showError(data.error);
                return;
            }

            displayResult(data);
            updateLastUpdate();
        } catch (error) {
            showError('Failed to convert currency. Please try again.');
            console.error('Error:', error);
        }
    }

    // Display conversion result
    function displayResult(data) {
        errorMessage.style.display = 'none';
        currencyResult.style.display = 'block';

        // Update conversion result
        conversionResult.textContent = `${data.result.toFixed(2)} ${data.to}`;
        conversionDetails.textContent = `1 ${data.from} = ${data.rate.toFixed(4)} ${data.to}`;

        // Update chart if available
        if (data.history && rateHistoryChart) {
            updateRateHistoryChart(data.history);
        }
    }

    // Update rate history chart
    function updateRateHistoryChart(history) {
        if (!history || !history.length) return;

        const ctx = rateHistoryChart.getContext('2d');
        const labels = history.map(item => item.date);
        const rates = history.map(item => item.rate);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Exchange Rate',
                    data: rates,
                    borderColor: '#10b981',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Update last update time
    function updateLastUpdate() {
        const now = new Date();
        lastUpdate.textContent = now.toLocaleString();
    }

    // Show error message
    function showError(message) {
        errorMessage.style.display = 'flex';
        errorMessage.querySelector('span').textContent = message;
        currencyResult.style.display = 'none';
    }
}); 